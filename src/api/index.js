// src/api/index.js

const express = require('express');
const userRoutes = require('./user.routes');
const publicDataRoutes = require('./publicData.routes');
const matchRoutes = require('./matches.routes');

const router = express.Router();

// 기본 라우트들 (나중에 구현 예정)
const authRoutes = express.Router();
const donationRoutes = express.Router();

// 임시 라우트들
authRoutes.get('/', (req, res) => {
  res.json({ message: 'Auth routes - Coming soon' });
});

donationRoutes.get('/', (req, res) => {
  res.json({ message: 'Donation routes - Coming soon' });
});

// API 라우트 등록
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);
router.use('/match', matchRoutes);
router.use('/public-data', publicDataRoutes);

module.exports = router;