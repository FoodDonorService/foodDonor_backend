// src/controllers/user.controller.js

const userService = require('../services/user.service');

class UserController {
  /**
   * 사용자 회원가입
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async signup(req, res) {
    try {
      const result = await userService.signup(req.body);
      
      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('회원가입 컨트롤러 오류:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || '회원가입 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 사용자 로그인
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async login(req, res) {
    try {
      const result = await userService.login(req.body);
      
      // 로그인 성공 시 사용자 정보를 세션에 저장 (쿠키 방식)
      req.session.userId = result.user.id;
      req.session.userRole = result.user.role;
      req.session.username = result.user.username;
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('로그인 컨트롤러 오류:', error);
      res.status(401).json({
        status: 'error',
        message: error.message || '로그인 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 역할별 사용자 검색
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async searchByRole(req, res) {
    try {
      const { role, q: searchTerm } = req.query;
      
      if (!role) {
        return res.status(400).json({
          status: 'error',
          message: 'role 파라미터가 필요합니다.'
        });
      }

      const result = await userService.searchByRole(role, searchTerm);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('사용자 검색 컨트롤러 오류:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || '사용자 검색 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 현재 로그인한 사용자 정보 조회
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다.'
        });
      }

      const result = await userService.getUserById(req.session.userId);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('사용자 정보 조회 컨트롤러 오류:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || '사용자 정보 조회 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 사용자 로그아웃
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('세션 삭제 오류:', err);
          return res.status(500).json({
            status: 'error',
            message: '로그아웃 중 오류가 발생했습니다.'
          });
        }

        res.clearCookie('connect.sid'); // 세션 쿠키 삭제
        res.status(200).json({
          status: 'success',
          message: '로그아웃 되었습니다.',
          data: null
        });
      });
    } catch (error) {
      console.error('로그아웃 컨트롤러 오류:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || '로그아웃 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * 사용자 정보 업데이트
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다.'
        });
      }

      const updateData = req.body;
      const result = await userService.updateProfile(req.session.userId, updateData);
      
      res.status(200).json({
        status: 'success',
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: result.data
      });
    } catch (error) {
      console.error('프로필 업데이트 컨트롤러 오류:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || '프로필 업데이트 중 오류가 발생했습니다.'
      });
    }
  }

  /**
   * DONOR 사용자의 레스토랑 정보 조회
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getRestaurant(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          status: 'error',
          message: '로그인이 필요합니다.'
        });
      }

      const result = await userService.getRestaurantByManagerId(req.session.userId);
      
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('레스토랑 정보 조회 컨트롤러 오류:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || '레스토랑 정보 조회 중 오류가 발생했습니다.'
      });
    }
  }
}

module.exports = new UserController();
