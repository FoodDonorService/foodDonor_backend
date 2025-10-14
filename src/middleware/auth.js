const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ status: 'error', message: '인증 토큰이 필요합니다.' });

    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, username, ... }
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: '유효하지 않은 인증 토큰입니다.' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: '접근 권한이 없습니다.' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles };


