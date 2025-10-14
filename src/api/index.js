// src/api/index.js

const express = require('express');
const userRoutes = require('./user.routes');
const publicDataRoutes = require('./publicData.routes');
const donationRoutes = require('./donations.routes');

const router = express.Router();

// 기본 라우트들 (나중에 구현 예정)
const authRoutes = express.Router();
const matchRoutes = express.Router();

// 임시 라우트들
authRoutes.get('/', (req, res) => {
  res.json({ message: 'Auth routes - Coming soon' });
});

matchRoutes.get('/', (req, res) => {
  res.json({ message: 'Match routes - Coming soon' });
});

// API 라우트 등록
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/donation', donationRoutes);
router.use('/matches', matchRoutes);
router.use('/public-data', publicDataRoutes);

module.exports = router;