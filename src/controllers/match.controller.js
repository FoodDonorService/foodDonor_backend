// src/controllers/match.controller.js

const matchService = require('../services/match.service');

class MatchController {
  /**
   * 매치 요청 생성
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createMatchRequest(req, res) {
    try {
      // 세션에서 사용자 ID 가져오기
      const recipientId = req.session.userId;
      
      if (!recipientId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다.'
        });
      }

      const { donation_id } = req.body;
      const donationId = parseInt(donation_id);

      if (isNaN(donationId)) {
        return res.status(400).json({
          status: 'error',
          message: '유효하지 않은 기부 ID입니다.'
        });
      }

      const result = await matchService.createMatchRequest(donationId, recipientId);
      
      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('매치 요청 생성 컨트롤러 오류:', error);
      
      if (error.message.includes('찾을 수 없습니다') || error.message.includes('이미 매치된')) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(400).json({
        status: 'error',
        message: error.message || '매치 요청 중 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new MatchController();