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
    
    // S3에서 레스토랑 데이터 조회
    const publicDataClient = require('../clients/publicData.client');
    const restaurants = await publicDataClient.getRestaurantsFromS3();
    
    // 기부 정보와 레스토랑 정보를 매핑하고 거리 계산
    const donationList = donations.map(donation => {
      // 레스토랑 정보 찾기
      const restaurant = restaurants.find(r => r.businessName === donation.restaurant_name);
      
      let distance = null;
      if (restaurant) {
        // S3Restaurant 모델의 calculateDistance 사용 (X, Y 좌표 기반)
        distance = restaurant.calculateDistance(longitude * 1000000, latitude * 1000000);
      }
      
      return {
        donation_id: donation.id,
        restaurant_name: donation.restaurant_name,
        restaurant_address: donation.restaurant_address,
        item_name: donation.item_name,
        category: donation.category,
        quantity: donation.quantity.toString(),
        expiration_date: donation.expiration_date,
        status: donation.status.toLowerCase(),
        distance: distance
      };
    });
    
    // 거리순으로 정렬 (거리가 null인 경우는 맨 뒤로)
    donationList.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    
    // 거리 정보 제거 (응답에 포함하지 않음)
    return donationList.map(({ distance, ...donation }) => donation);

  } catch (error) {
    console.error('거리순 기부처 목록 조회 서비스 오류:', error);
    throw error;
  }
};

module.exports = {
  createDonation,
  getDonationListByDistance
};