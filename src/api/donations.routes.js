// src/api/donations.routes.js

const express = require('express');
const donationController = require('../controllers/donation.controller');
const matchController = require('../controllers/match.controller');

const router = express.Router();

// 기부 등록 (기부자용)
router.post('/', donationController.createDonation);

// 기부 목록 조회 (수혜자용)
router.get('/list', donationController.getDonationList);

// 매치 요청 (수혜자용)
router.post('/:donation_id/accept', matchController.createMatchRequest);

module.exports = router;