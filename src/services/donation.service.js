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

module.exports = {
  createDonation
};