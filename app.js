// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const apiRoutes = require('./src/api');

const app = express();
const PORT = process.env.PORT || 3000;

// 프록시 뒤에서 HTTPS 인식(예: Nginx/ELB/CloudFront)
app.set('trust proxy', 1);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS 설정 (명시적 허용 Origin + 자격 증명 지원)
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_ORIGIN,
  'http://food-donor-frontend-v1.s3-website.ap-northeast-2.amazonaws.com',
  'http://localhost:3000'
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
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
    // 크로스사이트 쿠키 전송 위해 프로덕션에서는 SameSite=None + Secure 필요
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// API 라우트 등록
app.use('/', apiRoutes);

app.get('/check', (req, res) => {
  res.send('Food Donor Backend Server is Running!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
  console.log(`🍪 Cookie-based authentication enabled`);
  console.log(`📊 Database ready`);
});
