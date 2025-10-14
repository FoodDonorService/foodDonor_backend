// src/api/index.js

const express = require('express');
const userRoutes = require('./user.routes');
const publicDataRoutes = require('./publicData.routes');
const matchRoutes = require('./matches.routes');
const donationRoutes = require('./donations.routes');

const router = express.Router();


// API 라우트 등록
router.use('/users', userRoutes);
router.use('/donation', donationRoutes);
router.use('/matches', matchRoutes);
router.use('/public-data', publicDataRoutes);

module.exports = router;