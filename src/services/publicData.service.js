// src/services/publicData.service.js

const publicDataClient = require('../clients/publicData.client');

class PublicDataService {
  /**
   * 레스토랑 검색 서비스
   * @param {string} searchTerm - 검색어
   * @returns {Promise<object>} 검색 결과
   */
  async searchRestaurants(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('검색어를 입력해주세요.');
      }

      const restaurants = await publicDataClient.searchRestaurantsByName(searchTerm.trim());
      
      return {
        success: true,
        data: restaurants.map(restaurant => restaurant.toJSON()),
        count: restaurants.length,
        searchTerm: searchTerm.trim()
      };
    } catch (error) {
      console.error('레스토랑 검색 중 오류:', error);
      throw new Error(`레스토랑 검색 실패: ${error.message}`);
    }
  }

  /**
   * 수혜처 검색 서비스
   * @param {string} searchTerm - 검색어
   * @returns {Promise<object>} 검색 결과
   */
  async searchRecipients(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('검색어를 입력해주세요.');
      }

      const recipients = await publicDataClient.searchRecipientsByName(searchTerm.trim());
      
      return {
        success: true,
        data: recipients.map(recipient => recipient.toJSON()),
        count: recipients.length,
        searchTerm: searchTerm.trim()
      };
    } catch (error) {
      console.error('수혜처 검색 중 오류:', error);
      throw new Error(`수혜처 검색 실패: ${error.message}`);
    }
  }

  /**
   * 푸드뱅크 검색 서비스
   * @param {string} searchTerm - 검색어
   * @returns {Promise<object>} 검색 결과
   */
  async searchFoodbanks(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('검색어를 입력해주세요.');
      }

      const foodbanks = await publicDataClient.searchFoodbanksByName(searchTerm.trim());
      
      return {
        success: true,
        data: foodbanks.map(foodbank => foodbank.toJSON()),
        count: foodbanks.length,
        searchTerm: searchTerm.trim()
      };
    } catch (error) {
      console.error('푸드뱅크 검색 중 오류:', error);
      throw new Error(`푸드뱅크 검색 실패: ${error.message}`);
    }
  }

  /**
   * 가까운 레스토랑 조회 서비스
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {number} limit - 반환할 최대 개수
   * @returns {Promise<object>} 조회 결과
   */
  async getNearbyRestaurants(x, y, limit = 10) {
    try {
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('좌표는 숫자여야 합니다.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('limit은 1-100 사이의 값이어야 합니다.');
      }

      const restaurants = await publicDataClient.getNearbyRestaurants(x, y, limit);
      
      return {
        success: true,
        data: restaurants.map(restaurant => restaurant.toJSON()),
        count: restaurants.length,
        coordinates: { x, y },
        limit
      };
    } catch (error) {
      console.error('가까운 레스토랑 조회 중 오류:', error);
      throw new Error(`가까운 레스토랑 조회 실패: ${error.message}`);
    }
  }

  /**
   * 가까운 수혜처 조회 서비스
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} limit - 반환할 최대 개수
   * @returns {Promise<object>} 조회 결과
   */
  async getNearbyRecipients(latitude, longitude, limit = 10) {
    try {
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('위도와 경도는 숫자여야 합니다.');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('위도는 -90과 90 사이의 값이어야 합니다.');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('경도는 -180과 180 사이의 값이어야 합니다.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('limit은 1-100 사이의 값이어야 합니다.');
      }

      const recipients = await publicDataClient.getNearbyRecipients(latitude, longitude, limit);
      
      return {
        success: true,
        data: recipients.map(recipient => recipient.toJSON()),
        count: recipients.length,
        coordinates: { latitude, longitude },
        limit
      };
    } catch (error) {
      console.error('가까운 수혜처 조회 중 오류:', error);
      throw new Error(`가까운 수혜처 조회 실패: ${error.message}`);
    }
  }

  /**
   * 가까운 푸드뱅크 조회 서비스
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} limit - 반환할 최대 개수
   * @returns {Promise<object>} 조회 결과
   */
  async getNearbyFoodbanks(latitude, longitude, limit = 10) {
    try {
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('위도와 경도는 숫자여야 합니다.');
      }

      if (latitude < -90 || latitude > 90) {
        throw new Error('위도는 -90과 90 사이의 값이어야 합니다.');
      }

      if (longitude < -180 || longitude > 180) {
        throw new Error('경도는 -180과 180 사이의 값이어야 합니다.');
      }

      if (limit < 1 || limit > 100) {
        throw new Error('limit은 1-100 사이의 값이어야 합니다.');
      }

      const foodbanks = await publicDataClient.getNearbyFoodbanks(latitude, longitude, limit);
      
      return {
        success: true,
        data: foodbanks.map(foodbank => foodbank.toJSON()),
        count: foodbanks.length,
        coordinates: { latitude, longitude },
        limit
      };
    } catch (error) {
      console.error('가까운 푸드뱅크 조회 중 오류:', error);
      throw new Error(`가까운 푸드뱅크 조회 실패: ${error.message}`);
    }
  }

  /**
   * 모든 데이터 타입에 대한 통합 검색 서비스
   * @param {string} searchTerm - 검색어
   * @returns {Promise<object>} 통합 검색 결과
   */
  async searchAll(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('검색어를 입력해주세요.');
      }

      const [restaurants, recipients, foodbanks] = await Promise.all([
        publicDataClient.searchRestaurantsByName(searchTerm.trim()),
        publicDataClient.searchRecipientsByName(searchTerm.trim()),
        publicDataClient.searchFoodbanksByName(searchTerm.trim())
      ]);

      return {
        success: true,
        data: {
          restaurants: restaurants.map(restaurant => restaurant.toJSON()),
          recipients: recipients.map(recipient => recipient.toJSON()),
          foodbanks: foodbanks.map(foodbank => foodbank.toJSON())
        },
        counts: {
          restaurants: restaurants.length,
          recipients: recipients.length,
          foodbanks: foodbanks.length,
          total: restaurants.length + recipients.length + foodbanks.length
        },
        searchTerm: searchTerm.trim()
      };
    } catch (error) {
      console.error('통합 검색 중 오류:', error);
      throw new Error(`통합 검색 실패: ${error.message}`);
    }
  }
}

module.exports = new PublicDataService();
