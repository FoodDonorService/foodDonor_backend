// src/services/user.service.js

const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const publicDataClient = require('../clients/publicData.client');
const User = require('../models/user.model');

class UserService {
  constructor() {
    this.userRepo = userRepository;
    this.publicDataClient = publicDataClient;
    this.saltRounds = 10;
  }

  /**
   * 사용자 회원가입
   * @param {object} userData - 회원가입 데이터
   * @returns {Promise<object>} 회원가입 결과
   */
  async signup(userData) {
    try {
      // 입력 데이터 검증
      this.validateSignupData(userData);

      // 사용자명 중복 확인
      const isUsernameExists = await this.userRepo.isUsernameExists(userData.username);
      if (isUsernameExists) {
        throw new Error('이미 사용 중인 사용자명입니다.');
      }

      // 비밀번호 해시화
      const passwordHash = await bcrypt.hash(userData.password, this.saltRounds);

      // 사용자 객체 생성
      const user = new User({
        id: userData.id || null, // 요청에서 ID 받기
        username: userData.username,
        password_hash: passwordHash,
        name: userData.name,
        role: userData.role,
        address: userData.address,
        latitude: userData.latitude,
        longitude: userData.longitude,
        phone_number: userData.phone_number
      });

      // 데이터베이스에 저장
      const createdUser = await this.userRepo.create(user.toDBObject());

      return {
        success: true,
        message: '회원가입이 성공적으로 완료되었습니다.',
        data: null
      };
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw new Error(`회원가입 실패: ${error.message}`);
    }
  }

  /**
   * 사용자 로그인
   * @param {object} loginData - 로그인 데이터
   * @returns {Promise<object>} 로그인 결과
   */
  async login(loginData) {
    try {
      // 입력 데이터 검증
      this.validateLoginData(loginData);

      // 사용자 조회
      const user = await this.userRepo.findByUsername(loginData.username);
      if (!user) {
        throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.');
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.');
      }

      return {
        success: true,
        message: '로그인 되었습니다.',
        data: null,
        user: user.toJSON()
      };
    } catch (error) {
      console.error('로그인 실패:', error);
      throw new Error(`로그인 실패: ${error.message}`);
    }
  }

  /**
   * 역할별 공개 데이터 검색 (S3 CSV 데이터에서 검색)
   * @param {string} role - 사용자 역할
   * @param {string} searchTerm - 검색어
   * @returns {Promise<object>} 검색 결과
   */
  async searchByRole(role, searchTerm = '') {
    try {
      console.log('🔍 검색 요청:', { role, searchTerm });
      
      // 역할 검증
      this.validateRole(role);

      let searchResults = [];

      // 역할에 따라 다른 공개 데이터 검색
      switch (role.toUpperCase()) {
        case 'DONOR':
          // DONOR 역할일 때는 레스토랑 데이터 검색
          console.log('🍽️ 레스토랑 검색 중...');
          searchResults = await this.publicDataClient.searchRestaurantsByName(searchTerm);
          console.log('🍽️ 레스토랑 검색 결과:', searchResults.length, '개');
          break;
        case 'RECIPIENT':
          // RECIPIENT 역할일 때는 수혜처 데이터 검색
          console.log('🏥 수혜처 검색 중...');
          searchResults = await this.publicDataClient.searchRecipientsByName(searchTerm);
          console.log('🏥 수혜처 검색 결과:', searchResults.length, '개');
          break;
        case 'FOOD_BANK':
          // FOOD_BANK 역할일 때는 푸드뱅크 데이터 검색
          console.log('🏪 푸드뱅크 검색 중...');
          searchResults = await this.publicDataClient.searchFoodbanksByName(searchTerm);
          console.log('🏪 푸드뱅크 검색 결과:', searchResults.length, '개');
          break;
        default:
          throw new Error('지원하지 않는 역할입니다.');
      }

      // 응답 데이터 변환
      const dataList = searchResults.map(item => {
        if (role.toUpperCase() === 'DONOR') {
          // 레스토랑 데이터
          return {
            id: item.id,
            name: item.businessName,
            address: item.roadAddress || item.fullAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            phone_number: null // 레스토랑 데이터에는 전화번호가 없음
          };
        } else if (role.toUpperCase() === 'RECIPIENT') {
          // 수혜처 데이터
          return {
            id: item.id,
            name: item.facilityName,
            address: item.roadAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            phone_number: item.phoneNumber
          };
        } else if (role.toUpperCase() === 'FOOD_BANK') {
          // 푸드뱅크 데이터
          return {
            id: item.id,
            name: item.businessName,
            address: item.roadAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            phone_number: item.phoneNumber
          };
        }
      });

      return {
        success: true,
        message: '조회 성공',
        data: {
          list: dataList
        }
      };
    } catch (error) {
      console.error('공개 데이터 검색 실패:', error);
      throw new Error(`검색 실패: ${error.message}`);
    }
  }

  /**
   * 사용자 정보 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<object>} 사용자 정보
   */
  async getUserById(userId) {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      return {
        success: true,
        message: '사용자 정보 조회 성공',
        data: user.toJSON()
      };
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw new Error(`사용자 정보 조회 실패: ${error.message}`);
    }
  }

  /**
   * 회원가입 데이터 검증
   * @param {object} userData - 회원가입 데이터
   */
  validateSignupData(userData) {
    const requiredFields = ['username', 'password', 'name', 'role'];
    
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field}은(는) 필수 입력 항목입니다.`);
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.username)) {
      throw new Error('올바른 이메일 형식이 아닙니다.');
    }

    // 비밀번호 강도 검증
    if (userData.password.length < 8) {
      throw new Error('비밀번호는 최소 8자 이상이어야 합니다.');
    }

    // 역할 검증
    this.validateRole(userData.role);
  }

  /**
   * 로그인 데이터 검증
   * @param {object} loginData - 로그인 데이터
   */
  validateLoginData(loginData) {
    if (!loginData.username || !loginData.password) {
      throw new Error('사용자명과 비밀번호를 입력해주세요.');
    }
  }

  /**
   * 역할 검증
   * @param {string} role - 사용자 역할
   */
  validateRole(role) {
    const validRoles = ['DONOR', 'RECIPIENT', 'FOOD_BANK'];
    if (!validRoles.includes(role.toUpperCase())) {
      throw new Error(`유효하지 않은 역할입니다. 가능한 역할: ${validRoles.join(', ')}`);
    }
  }
}

module.exports = new UserService();