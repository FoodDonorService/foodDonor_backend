// src/api/matches.routes.js

const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');

/**
 * @route GET /match/list/accepted
 * @desc 푸드뱅크가 할당받은 매치들의 상세정보 조회
 * @access Private (FOOD_BANK only)
 */
router.get('/list/accepted', matchController.getAcceptedMatches.bind(matchController));


module.exports = router;