// src/controllers/donation.controller.js

const donationService = require('../services/donation.service');

/**
 * 기부 등록
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDonation = async (req, res) => {
  try {
    // JWT 인증 사용 (authenticate 미들웨어가 보장)

    // DONOR 역할 확인
    if (req.user.role !== 'DONOR') {
      return res.status(403).json({ 
        status: 'error', 
        message: '기부자만 기부를 등록할 수 있습니다.' 
      });
    }

    const { category, item_name, quantity, expiration_date } = req.body;

    // 필수 필드 검증
    if (!category || !item_name || !quantity || !expiration_date) {
      return res.status(400).json({
        status: 'error',
        message: '모든 필수 필드를 입력해주세요. (category, item_name, quantity, expiration_date)'
      });
    }

    // 수량 검증
    if (quantity <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '수량은 0보다 커야 합니다.'
      });
    }

    // 유통기한 검증
    const expirationDate = new Date(expiration_date);
    if (isNaN(expirationDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 날짜 형식을 입력해주세요. (YYYY-MM-DD)'
      });
    }

    // 기부 등록
    const donationData = {
      category,
      item_name,
      quantity,
      expiration_date,
      userId: req.user.id,
    };

    const result = await donationService.createDonation(donationData);

    res.status(201).json({
      status: 'success',
      message: '기부 품목이 성공적으로 등록되었습니다.',
      data: {
        donation_id: result.id
      }
    });

  } catch (error) {
    console.error('기부 등록 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '기부 등록 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 기부처 목록 조회 (거리순)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDonationList = async (req, res) => {
  try {
    // RECIPIENT 역할 확인 (JWT)
    if (req.user.role !== 'RECIPIENT') {
      return res.status(403).json({ 
        status: 'error', 
        message: '수혜자만 기부처 정보를 조회할 수 있습니다.' 
      });
    }

    const { lat, lng } = req.query;

    // 위치 정보 검증
    if (!lat || !lng) {
      return res.status(400).json({
        status: 'error',
        message: '위도(lat)와 경도(lng) 정보가 필요합니다.'
      });
    }

    // 위도, 경도 숫자 검증
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 위도와 경도 값을 입력해주세요.'
      });
    }

    // 기부처 목록 조회
    const donationList = await donationService.getDonationListByDistance(latitude, longitude);

    res.json({
      status: 'success',
      message: '거리순으로 기부처들 정보를 조회했습니다.',
      data: {
        list: donationList
      }
    });

  } catch (error) {
    console.error('기부처 목록 조회 오류:', error);
    res.status(500).json({
      status: 'error',
      message: '기부처 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 기부 수락 (매칭 생성)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const acceptDonation = async (req, res) => {
  try {
    // RECIPIENT 역할 확인 (JWT)
    if (req.user.role !== 'RECIPIENT') {
      return res.status(403).json({ 
        status: 'error', 
        message: '수혜자만 기부를 수락할 수 있습니다.' 
      });
    }

    const { donation_id } = req.params;
    const { donation_id: bodyDonationId } = req.body;

    // URL 파라미터와 body의 donation_id가 일치하는지 확인
    if (donation_id !== bodyDonationId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL 파라미터와 요청 본문의 donation_id가 일치하지 않습니다.'
      });
    }

    // donation_id 검증
    const donationId = parseInt(donation_id);
    if (isNaN(donationId) || donationId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '유효한 donation_id를 입력해주세요.'
      });
    }

    // 기부 수락 처리
    const result = await donationService.acceptDonation(donationId, req.user.id);

    res.status(201).json({
      status: 'success',
      message: '매칭 요청이 등록되었습니다.',
      data: result
    });

  } catch (error) {
    console.error('기부 수락 오류:', error);
    
    // 에러 메시지에 따라 적절한 상태 코드 설정
    let statusCode = 500;
    if (error.message.includes('찾을 수 없습니다') || error.message.includes('이미 처리된')) {
      statusCode = 404;
    } else if (error.message.includes('이미 매칭이 생성된')) {
      statusCode = 409;
    } else if (error.message.includes('근처에 푸드뱅크를 찾을 수 없습니다')) {
      statusCode = 404;
    }

    res.status(statusCode).json({
      status: 'error',
      message: error.message || '기부 수락 중 오류가 발생했습니다.'
    });
  }
};



module.exports = {
  createDonation,
  getDonationList,
  acceptDonation
};