// src/api/matches.routes.js

const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

//1.2.7 푸드뱅크 -> 매치 요청 조회
router.get('/list', authenticate, authorizeRoles('FOOD_BANK'), matchController.getPendingMatches);

//1.2.10 푸드뱅크 -> 자신에게 할당된 매치 상세정보 조회
router.get('/list/accepted', authenticate, authorizeRoles('FOOD_BANK'), matchController.getAcceptedMatches);

//1.2.8 푸드뱅크 -> 매치 수락
router.post('/accept', authenticate, authorizeRoles('FOOD_BANK'), matchController.acceptMatch);

//1.2.9 푸드뱅크 ->매치 거절
router.post('/reject', authenticate, authorizeRoles('FOOD_BANK'), matchController.rejectMatch);

module.exports = router;