// src/api/publicData.routes.js

const express = require('express');
const publicDataController = require('../controllers/publicData.controller');

const router = express.Router();

/**
 * @route GET /api/public-data/search/restaurants
 * @desc 레스토랑 검색
 * @query {string} q - 검색어
 * @access Public
 */
router.get('/search/restaurants', publicDataController.searchRestaurants);

/**
 * @route GET /api/public-data/search/recipients
 * @desc 수혜처 검색
 * @query {string} q - 검색어
 * @access Public
 */
router.get('/search/recipients', publicDataController.searchRecipients);

/**
 * @route GET /api/public-data/search/foodbanks
 * @desc 푸드뱅크 검색
 * @query {string} q - 검색어
 * @access Public
 */
router.get('/search/foodbanks', publicDataController.searchFoodbanks);

/**
 * @route GET /api/public-data/search/all
 * @desc 통합 검색 (모든 타입)
 * @query {string} q - 검색어
 * @access Public
 */
router.get('/search/all', publicDataController.searchAll);

/**
 * @route GET /api/public-data/nearby/restaurants
 * @desc 가까운 레스토랑 조회
 * @query {number} x - X 좌표
 * @query {number} y - Y 좌표
 * @query {number} limit - 반환할 최대 개수 (기본값: 10)
 * @access Public
 */
router.get('/nearby/restaurants', publicDataController.getNearbyRestaurants);

/**
 * @route GET /api/public-data/nearby/recipients
 * @desc 가까운 수혜처 조회
 * @query {number} lat - 위도
 * @query {number} lng - 경도
 * @query {number} limit - 반환할 최대 개수 (기본값: 10)
 * @access Public
 */
router.get('/nearby/recipients', publicDataController.getNearbyRecipients);

/**
 * @route GET /api/public-data/nearby/foodbanks
 * @desc 가까운 푸드뱅크 조회
 * @query {number} lat - 위도
 * @query {number} lng - 경도
 * @query {number} limit - 반환할 최대 개수 (기본값: 10)
 * @access Public
 */
router.get('/nearby/foodbanks', publicDataController.getNearbyFoodbanks);

module.exports = router;
