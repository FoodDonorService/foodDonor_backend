// src/controllers/donation.controller.js

const donationService = require('../services/donation.service');

class DonationController {
  /**
   * 기부 등록
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createDonation(req, res) {
    try {
      // 세션에서 사용자 ID 가져오기
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다.'
        });
      }

      const result = await donationService.createDonation(req.body, userId);
      
      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('기부 등록 컨트롤러 오류:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || '기부 등록 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 기부 목록 조회
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getDonationList(req, res) {
    try {
      // 쿼리 파라미터에서 위치 정보 가져오기 (선택사항)
      const { latitude, longitude } = req.query;
      
      const userLatitude = latitude ? parseFloat(latitude) : null;
      const userLongitude = longitude ? parseFloat(longitude) : null;

      const result = await donationService.getDonationList(userLatitude, userLongitude);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('기부 목록 조회 컨트롤러 오류:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || '기부 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

}

module.exports = new DonationController();