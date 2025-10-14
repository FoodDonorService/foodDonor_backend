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
      //입략: 검색어  q를 입력
      //검증: 검색어가 없으면 HTTP 400 error
      //처리: publicDataService.searchRestaurants(searchTerm) 호출 ->서비스 계층에서 실제 검색 수행
      //출력: JSON형태로 검색 결과 반환
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
      //로직 구조: 위의 searchRestaurants와 동일하나, 호출하는 서비스 함수만 다름 (searchRecipients)
      //역할: ‘필요한 검색어 입력 → 서비스 로직 호출 → 결과 전송’ 구조
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
      //기능: publicDataService.getNearbyRestaurants(xCoord, yCoord, limitNum) 호출
      //출력: 근처 위치의 레스토랑 리스트 JSON 응답
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
      //로직: 위와 거의 같지만, 파라미터명이 x, y → lat, lng로 바뀜 (일반적인 위도/경도 명칭)
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
      //목적: 사용자 위치를 기준으로 가까운 푸드뱅크 제공
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
      //검색어로 레스트,수혜처, 푸드뱅크 등을 한꺼번에 검색
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
