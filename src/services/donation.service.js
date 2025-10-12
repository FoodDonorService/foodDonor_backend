// src/services/donation.service.js

const donationRepository = require('../repositories/donation.repository');
const Donation = require('../models/donation.model');

class DonationService {
  /**
   * 기부 등록
   * @param {object} donationData - 기부 데이터
   * @param {number} userId - 사용자 ID
   * @returns {Promise<object>} 결과 객체
   */
  async createDonation(donationData, userId) {
    try {
      // 사용자의 레스토랑 ID 조회
      const restaurantId = await donationRepository.findRestaurantIdByUserId(userId);
      
      if (!restaurantId) {
        throw new Error('해당 사용자의 레스토랑이 존재하지 않습니다.');
      }

      // 기부 데이터 생성
      const donation = new Donation({
        restaurant_id: restaurantId,
        item_name: donationData.item_name,
        category: donationData.category,
        quantity: donationData.quantity,
        expiration_date: donationData.expiration_date,
        status: 'AVAILABLE'
      });

      // 유효성 검사
      if (!donation.itemName || !donation.category || !donation.quantity || !donation.expirationDate) {
        throw new Error('필수 필드가 누락되었습니다.');
      }

      if (donation.quantity <= 0) {
        throw new Error('수량은 0보다 커야 합니다.');
      }

      // 유통기한 검사
      const expirationDate = new Date(donation.expirationDate);
      const today = new Date();
      if (expirationDate <= today) {
        throw new Error('유통기한은 오늘 이후여야 합니다.');
      }

      // 기부 등록
      const createdDonation = await donationRepository.createDonation(donation.toDBObject());

      return {
        message: '기부 품목이 성공적으로 등록되었습니다.',
        data: {
          donation_id: createdDonation.id
        }
      };
    } catch (error) {
      console.error('기부 등록 서비스 오류:', error);
      throw error;
    }
  }

  /**
   * 기부 목록 조회
   * @param {number} userLatitude - 사용자 위도 (선택사항)
   * @param {number} userLongitude - 사용자 경도 (선택사항)
   * @returns {Promise<object>} 결과 객체
   */
  async getDonationList(userLatitude = null, userLongitude = null) {
    try {
      const donations = await donationRepository.findAvailableDonations(userLatitude, userLongitude);

      const donationList = donations.map(donation => ({
        donation_id: donation.id,
        restaurant_name: donation.restaurant_name,
        restaurant_address: donation.restaurant_address,
        item_name: donation.itemName,
        category: donation.category,
        quantity: donation.quantity.toString(),
        expiration_date: donation.expirationDate,
        status: donation.status.toLowerCase()
      }));

      return {
        message: '거리순으로 기부처들 정보를 조회했습니다.',
        data: {
          list: donationList
        }
      };
    } catch (error) {
      console.error('기부 목록 조회 서비스 오류:', error);
      throw error;
    }
  }

}

module.exports = new DonationService();