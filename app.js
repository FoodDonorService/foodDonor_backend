// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const apiRoutes = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTPS 사용 시 true로 변경
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

app.get('/', (req, res) => {
  res.send('Food Donor Backend Server is Running!');
});

// API 라우트 등록
app.use('/api', apiRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`🍪 Cookie-based authentication enabled`);
  console.log(`📊 Database ready`);
});
