// src/services/match.service.js

const matchRepository = require('../repositories/match.repository');
const Match = require('../models/match.model');

class MatchService {
  /**
   * 매치 요청 생성
   * @param {number} donationId - 기부 ID
   * @param {number} recipientId - 수혜자 ID
   * @returns {Promise<object>} 결과 객체
   */
  async createMatchRequest(donationId, recipientId) {
    try {
      // 기존 매치 요청 확인
      const existingMatch = await matchRepository.findByDonationId(donationId);
      
      if (existingMatch) {
        throw new Error('이미 매치 요청이 존재합니다.');
      }

      // 푸드뱅크 사용자 조회
      const foodBankId = await matchRepository.findFoodBankUser();
      
      if (!foodBankId) {
        throw new Error('푸드뱅크 사용자를 찾을 수 없습니다.');
      }

      // 매치 데이터 생성
      const match = new Match({
        donation_id: donationId,
        recipient_id: recipientId,
        food_bank_id: foodBankId,
        status: 'ACCEPTED' // 요구사항에 따라 바로 ACCEPTED 상태로 설정
      });

      // 매치 생성
      const createdMatch = await matchRepository.createMatch(match.toDBObject());

      return {
        message: '매칭 요청이 등록되었습니다.',
        data: {
          match_id: createdMatch.id,
          recipient_id: createdMatch.recipientId,
          donation_id: createdMatch.donationId,
          food_bank_id: createdMatch.foodBankId,
          status: createdMatch.status
        }
      };
    } catch (error) {
      console.error('매치 요청 생성 서비스 오류:', error);
      throw error;
    }
  }
}

module.exports = new MatchService();