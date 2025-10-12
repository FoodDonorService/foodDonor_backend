// src/controllers/publicData.controller.js

const publicDataService = require('../services/publicData.service');

class PublicDataController {
  /**
   * 레스토랑 검색 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async searchRestaurants(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: '검색어(q) 파라미터가 필요합니다.'
        });
      }

      const result = await publicDataService.searchRestaurants(searchTerm);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('레스토랑 검색 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 수혜처 검색 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async searchRecipients(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: '검색어(q) 파라미터가 필요합니다.'
        });
      }

      const result = await publicDataService.searchRecipients(searchTerm);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('수혜처 검색 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 푸드뱅크 검색 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async searchFoodbanks(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: '검색어(q) 파라미터가 필요합니다.'
        });
      }

      const result = await publicDataService.searchFoodbanks(searchTerm);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('푸드뱅크 검색 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 가까운 레스토랑 조회 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getNearbyRestaurants(req, res) {
    try {
      const { x, y, limit } = req.query;
      
      if (!x || !y) {
        return res.status(400).json({
          success: false,
          message: 'x, y 좌표 파라미터가 필요합니다.'
        });
      }

      const xCoord = parseFloat(x);
      const yCoord = parseFloat(y);
      const limitNum = limit ? parseInt(limit) : 10;

      if (isNaN(xCoord) || isNaN(yCoord)) {
        return res.status(400).json({
          success: false,
          message: 'x, y 좌표는 숫자여야 합니다.'
        });
      }

      const result = await publicDataService.getNearbyRestaurants(xCoord, yCoord, limitNum);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('가까운 레스토랑 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 가까운 수혜처 조회 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getNearbyRecipients(req, res) {
    try {
      const { lat, lng, limit } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng 좌표 파라미터가 필요합니다.'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const limitNum = limit ? parseInt(limit) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng 좌표는 숫자여야 합니다.'
        });
      }

      const result = await publicDataService.getNearbyRecipients(latitude, longitude, limitNum);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('가까운 수혜처 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 가까운 푸드뱅크 조회 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getNearbyFoodbanks(req, res) {
    try {
      const { lat, lng, limit } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng 좌표 파라미터가 필요합니다.'
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const limitNum = limit ? parseInt(limit) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng 좌표는 숫자여야 합니다.'
        });
      }

      const result = await publicDataService.getNearbyFoodbanks(latitude, longitude, limitNum);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('가까운 푸드뱅크 조회 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 통합 검색 API
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async searchAll(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: '검색어(q) 파라미터가 필요합니다.'
        });
      }

      const result = await publicDataService.searchAll(searchTerm);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('통합 검색 컨트롤러 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new PublicDataController();
