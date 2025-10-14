// src/services/donation.service.js

const donationRepository = require('../repositories/donation.repository');
const matchRepository = require('../repositories/match.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const publicDataClient = require('../clients/publicData.client');
const Donation = require('../models/donation.model');
const Match = require('../models/match.model');

/**
 * 기부 등록 서비스
 * @param {Object} donationData - 기부 데이터
 * @returns {Promise<Object>} 생성된 기부 정보
 */
const createDonation = async (donationData) => {
  try {
    // 사용자의 레스토랑 정보 조회
    const restaurant = await donationRepository.getRestaurantByUserId(donationData.userId);
    
    if (!restaurant) {
      throw new Error('사용자에게 등록된 기부 내용이 없습니다.');
    }

    // Donation 모델 인스턴스 생성
    const donation = new Donation({
      restaurant_id: restaurant.id,
      item_name: donationData.item_name,
      category: donationData.category,
      quantity: donationData.quantity,
      expiration_date: donationData.expiration_date,
      status: 'AVAILABLE'
    });

    // 데이터베이스에 저장
    const result = await donationRepository.createDonation(donation.toDBObject());
    
    return {
      id: result.insertId,
      ...donation.toJSON()
    };

  } catch (error) {
    console.error('기부 등록 서비스 오류:', error);
    throw error;
  }
};

/**
 * 거리순으로 기부처 목록 조회 서비스
 * @param {number} latitude - 수혜자 위도
 * @param {number} longitude - 수혜자 경도
 * @returns {Promise<Array>} 거리순으로 정렬된 기부처 목록
 */
const getDonationListByDistance = async (latitude, longitude) => {
  try {
    // 데이터베이스에서 사용 가능한 기부 목록 조회
    const donations = await donationRepository.getAvailableDonations();
    
    // publicData.client.js의 getNearbyRestaurants 함수 사용
    const publicDataClient = require('../clients/publicData.client');
    
    // 수혜자 위치를 한국 좌표계로 변환 (위경도 * 1000000)
    const xCoord = longitude * 1000000;
    const yCoord = latitude * 1000000;
    
    // 거리순으로 정렬된 레스토랑 목록 조회 (충분한 개수로 설정)
    const nearbyRestaurants = await publicDataClient.getNearbyRestaurants(xCoord, yCoord, donations.length);
    
    // 기부 정보와 레스토랑 정보를 매핑
    const donationList = donations.map(donation => {
      // 레스토랑 정보 찾기
      const restaurant = nearbyRestaurants.find(r => r.businessName === donation.restaurant_name);
      
      return {
        donation_id: donation.id,
        restaurant_name: donation.restaurant_name,
        restaurant_address: donation.restaurant_address,
        item_name: donation.item_name,
        category: donation.category,
        quantity: donation.quantity.toString(),
        expiration_date: donation.expiration_date,
        status: donation.status.toLowerCase()
      };
    });
    
    // 레스토랑 정보가 있는 기부만 필터링하고 거리순으로 정렬
    const validDonations = donationList.filter(donation => {
      return nearbyRestaurants.some(r => r.businessName === donation.restaurant_name);
    });
    
    // 거리순으로 정렬 (getNearbyRestaurants에서 이미 정렬되어 있음)
    const sortedDonations = [];
    for (const restaurant of nearbyRestaurants) {
      const matchingDonation = validDonations.find(d => d.restaurant_name === restaurant.businessName);
      if (matchingDonation) {
        sortedDonations.push(matchingDonation);
      }
    }
    
    return sortedDonations;

  } catch (error) {
    console.error('거리순 기부처 목록 조회 서비스 오류:', error);
    throw error;
  }
};

/**
 * 기부 수락 서비스 (매칭 생성)
 * @param {number} donationId - 기부 ID
 * @param {number} recipientId - 수혜자 ID (세션에서 가져옴)
 * @returns {Promise<Object>} 생성된 매칭 정보
 */
const acceptDonation = async (donationId, recipientId) => {
  try {
    // 1. 기부 정보 조회
    const donation = await donationRepository.findById(donationId);
    if (!donation) {
      throw new Error('기부 정보를 찾을 수 없습니다.');
    }

    // 2. 기부가 사용 가능한 상태인지 확인
    if (!donation.isAvailable()) {
      throw new Error('이미 처리된 기부입니다.');
    }

    // 3. 기부가 만료되었는지 확인
    if (donation.isExpired()) {
      throw new Error('만료된 기부입니다.');
    }

    // 4. 이미 매칭이 존재하는지 확인
    const existingMatch = await matchRepository.findByDonationId(donationId);
    if (existingMatch) {
      throw new Error('이미 매칭이 생성된 기부입니다.');
    }

    // 5. 레스토랑 정보 조회
    const restaurant = await restaurantRepository.findById(donation.restaurantId);
    if (!restaurant) {
      throw new Error('레스토랑 정보를 찾을 수 없습니다.');
    }

    // 6. 가장 가까운 푸드뱅크 찾기
    // 레스토랑 좌표를 한국 좌표계로 변환 (위경도 * 1000000)
    const xCoord = restaurant.longitude * 1000000;
    const yCoord = restaurant.latitude * 1000000;
    
    const nearbyFoodbanks = await publicDataClient.getNearbyFoodbanks(restaurant.latitude, restaurant.longitude, 1);
    
    if (nearbyFoodbanks.length === 0) {
      throw new Error('근처에 푸드뱅크를 찾을 수 없습니다.');
    }

    const nearestFoodbank = nearbyFoodbanks[0];
    
    // 7. 매칭 생성
    const match = new Match({
      donation_id: donationId,
      recipient_id: recipientId,
      food_bank_id: nearestFoodbank.id, // S3 데이터의 ID 사용
      status: 'PENDING'
    });

    const createdMatch = await matchRepository.create(match.toDBObject());

    // 8. 기부 상태를 REQUESTED로 업데이트
    await donationRepository.updateStatus(donationId, 'REQUESTED');

    return {
      match_id: createdMatch.id,
      recipient_id: recipientId,
      donation_id: donationId,
      food_bank_id: nearestFoodbank.id,
      status: 'pending'
    };

  } catch (error) {
    console.error('기부 수락 서비스 오류:', error);
    throw error;
  }
};

module.exports = {
  createDonation,
  getDonationListByDistance,
  acceptDonation
};