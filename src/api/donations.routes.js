// src/api/donations.routes.js

const express = require('express');
const donationController = require('../controllers/donation.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * @route POST /donation
 * @desc 기부 등록
 * @body {string} category - 기부 품목 카테고리
 * @body {string} item_name - 기부 품목 이름
 * @body {number} quantity - 기부 품목 수량
 * @body {string} expiration_date - 유통기한 (YYYY-MM-DD)
 * @access Private (DONOR role required)
 */
router.post('/', authenticate, authorizeRoles('DONOR'), donationController.createDonation);

/**
 * @route GET /donation/list
 * @desc 수혜자가 거리순으로 기부처 정보 조회
 * @query {number} lat - 수혜자 위도
 * @query {number} lng - 수혜자 경도
 * @access Private (RECIPIENT role required)
 */
router.get('/list', authenticate, authorizeRoles('RECIPIENT'), donationController.getDonationList);

/**
 * @route POST /donation/:donation_id/accept
 * @desc 수혜자가 기부를 수락하여 매칭 생성
 * @param {number} donation_id - 기부 ID
 * @body {number} donation_id - 기부 ID (URL 파라미터와 동일해야 함)
 * @access Private (RECIPIENT role required)
 */
router.post('/:donation_id/accept', authenticate, authorizeRoles('RECIPIENT'), donationController.acceptDonation);

module.exports = router;