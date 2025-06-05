const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'kolaysatis_super_secret_key_2024';

// JWT Token oluştur
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// JWT Token doğrula
const authenticateToken = async (req, res, next) => {
  try {
    // Header'dan token al
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        message: 'Token bulunamadı!',
        error: 'Unauthorized'
      });
    }

    // Token'ı doğrula
    console.log('🔓 JWT Secret:', JWT_SECRET); // DEBUG
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Decoded Token:', decoded); // DEBUG

    // Kullanıcıyı database'den al
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        message: 'Geçersiz kullanıcı!',
        error: 'Unauthorized'
      });
    }

    // Kullanıcı bilgilerini req'e ekle
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`
    };

    next();
  } catch (error) {
    console.log('❌ Auth Error:', error.message); // DEBUG
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token süresi dolmuş!',
        error: 'Token Expired'
      });
    }

    return res.status(403).json({
      message: 'Geçersiz token!',
      error: 'Invalid Token'
    });
  }
};

// Rol kontrolü
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Kullanıcı bilgisi bulunamadı!',
        error: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bu işlem için yetkiniz yok!',
        error: 'Forbidden',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin kontrolü
const requireAdmin = requireRole('admin');

// Satıcı veya Admin kontrolü
const requireSellerOrAdmin = requireRole('seller', 'admin');

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSellerOrAdmin
};