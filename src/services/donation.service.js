// src/services/donation.service.js

const donationRepository = require('../repositories/donation.repository');
const Donation = require('../models/donation.model');

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

module.exports = {
  createDonation,
  getDonationListByDistance
};