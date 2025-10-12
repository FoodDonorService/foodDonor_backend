// src/controllers/donation.controller.js

const donationService = require('../services/donation.service');

/**
 * 기부 등록
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDonation = async (req, res) => {
  try {
    // 세션에서 사용자 정보 확인
    if (!req.session.userId) {
      return res.status(401).json({ 
        status: 'error', 
        message: '인증이 필요합니다.' 
      });
    }

    // DONOR 역할 확인
    if (req.session.userRole !== 'DONOR') {
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
      userId: req.session.userId
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

module.exports = {
  createDonation
};