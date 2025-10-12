// src/api/donations.routes.js

const express = require('express');
const donationController = require('../controllers/donation.controller');

const router = express.Router();

/**
 * @route POST /donation
 * @desc 기부 등록
 * @body {string} category - 기부 품목 카테고리
 * @body {string} item_name - 기부 품목 이름
 * @body {number} quantity - 기부 품목 수량
 * @body {string} expiration_date - 유통기한 (YYYY-MM-DD)
 */
router.post('/', donationController.createDonation);

module.exports = router;