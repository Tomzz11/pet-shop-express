import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware ตรวจสอบ JWT Token
export const protect = async (req, res, next) => {
  let token;

  // ตรวจสอบ Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // ดึง token จาก header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ดึงข้อมูล user (ไม่รวม password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'ไม่พบผู้ใช้งาน'
        });
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token ไม่ถูกต้องหรือหมดอายุ'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบ'
    });
  }
};

// Middleware ตรวจสอบ Admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น Admin)'
    });
  }
};
