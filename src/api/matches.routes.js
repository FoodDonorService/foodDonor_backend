//
const express = require('express');
const matchController = require('../controllers/match.controller')
const router = express.Router();

//1.2.7 푸드뱅크 -> 매치 요청 조회
router.get('/list',matchController.getPendingMatches);

//1.2.10 푸드뱅크 -> 자신에게 할당된 매치 상세정보 조회
router.get('/list/accepted',matchController.getAcceptedMatches);

//1.2.8 푸드뱅크 -> 매치 수락
router.get('/accept',matchController.acceptMatch);

//1.2.9 푸드뱅크 ->매치 거절
router.get('/reject',matchController.rejectMatch);

module.exports = router;