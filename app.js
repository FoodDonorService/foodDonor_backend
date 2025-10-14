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

// CORS 설정 (모든 출처 허용 + 자격 증명 지원, 안전한 Origin 반영)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // 비브라우저 클라이언트(curl 등) 대비 기본 허용
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    // Preflight 요청 빠른 응답
    return res.sendStatus(204);
  }
  next();
});

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
