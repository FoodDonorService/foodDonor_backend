// src/controllers/match.controller.js

const matchService = require('../services/match.service');

/**
 * Match Controller - handles HTTP requests for matches
 */
class MatchController {
  /**
   * Get accepted matches for a food bank
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAcceptedMatches(req, res) {
    try {
      // Get food bank ID from session
      const foodBankId = req.session?.user?.id;
      
      if (!foodBankId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다'
        });
      }

      // Call service to get matches
      const result = await matchService.getAcceptedMatches(foodBankId);

      // Return success response
      res.status(200).json({
        status: 'success',
        message: '매치 상세정보 조회 성공',
        data: result.data
      });

    } catch (error) {
      console.error('Error in MatchController.getAcceptedMatches:', error);
      
      res.status(500).json({
        status: 'error',
        message: '매치 상세정보 조회 실패',
        error: error.message
      });
    }
  }
}

module.exports = new MatchController();