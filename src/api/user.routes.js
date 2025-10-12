// src/api/user.routes.js

const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

/**
 * @route POST /api/users/signup
 * @desc 사용자 회원가입
 * @access Public
 */
router.post('/signup', userController.signup);

/**
 * @route POST /api/users/login
 * @desc 사용자 로그인
 * @access Public
 */
router.post('/login', userController.login);

/**
 * @route GET /api/users/search
 * @desc 역할별 사용자 검색
 * @query {string} role - 사용자 역할 (DONOR, RECIPIENT, FOOD_BANK)
 * @query {string} q - 검색어 (선택사항)
 * @access Public
 */
router.get('/search', userController.searchByRole);

/**
 * @route GET /api/users/me
 * @desc 현재 로그인한 사용자 정보 조회
 * @access Private
 */
router.get('/me', userController.getCurrentUser);

/**
 * @route POST /api/users/logout
 * @desc 사용자 로그아웃
 * @access Private
 */
router.post('/logout', userController.logout);

/**
 * @route PUT /api/users/profile
 * @desc 사용자 프로필 업데이트
 * @access Private
 */
router.put('/profile', userController.updateProfile);

module.exports = router;