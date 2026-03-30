const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { 
  validatePassword, 
  validateEmail, 
  validateIraqiPhone,
  logLoginAttempt,
  bruteForceProtection,
  authErrorHandler
} = require('../middleware/authEnhanced');
const { logUserAction, logError } = require('../utils/logger');

const router = express.Router();

// تسجيل مستخدم جديد
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // التحقق من الحقول المطلوبة
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'جميع الحقول مطلوبة' 
      });
    }

    // التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمات المرور غير متطابقة' 
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: emailValidation.message 
      });
    }

    // التحقق من صحة رقم الهاتف
    const phoneValidation = validateIraqiPhone(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: phoneValidation.message 
      });
    }

    // التحقق من صحة كلمة المرور
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمة المرور غير صالحة',
        errors: passwordValidation.errors 
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني موجود بالفعل' 
      });
    }

    // إنشاء المستخدم
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      phone: phone.trim(), 
      password 
    });
    
    await user.save();

    // إنشاء التوكن
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // تسجيل العملية
    logUserAction(user._id, 'user_registered', {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    logError(error, req, { type: 'registration_error' });
    next(error);
  }
});

// تسجيل الدخول
router.post('/login', logLoginAttempt, bruteForceProtection, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // التحقق من الحقول المطلوبة
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: emailValidation.message 
      });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'بيانات دخول غير صحيحة' 
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // تسجيل محاولة فاشلة
      logUserAction(user._id, 'login_failed', {
        email: user.email,
        ip: req.ip,
        reason: 'invalid_password'
      });
      
      return res.status(401).json({ 
        success: false,
        message: 'بيانات دخول غير صحيحة' 
      });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // تسجيل العملية الناجحة
    logUserAction(user._id, 'login_success', {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (error) {
    logError(error, req, { type: 'login_error' });
    next(error);
  }
});

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'المستخدم غير موجود' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logError(error, req, { type: 'get_user_error' });
    next(error);
  }
});

// تحديث بيانات المستخدم
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = {};

    // التحقق من صحة البيانات
    if (name) {
      updateData.name = name.trim();
    }

    if (phone) {
      const phoneValidation = validateIraqiPhone(phone);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ 
          success: false,
          message: phoneValidation.message 
        });
      }
      updateData.phone = phone.trim();
    }

    if (address) {
      updateData.address = address;
    }

    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // تسجيل العملية
    logUserAction(req.user.id, 'profile_updated', {
      updatedFields: Object.keys(updateData),
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      user
    });
  } catch (error) {
    logError(error, req, { type: 'update_user_error' });
    next(error);
  }
});

// تغيير كلمة المرور
router.put('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // التحقق من الحقول
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'جميع الحقول مطلوبة' 
      });
    }

    // التحقق من تطابق كلمات المرور الجديدة
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمات المرور الجديدة غير متطابقة' 
      });
    }

    // التحقق من صحة كلمة المرور الجديدة
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمة المرور الجديدة غير صالحة',
        errors: passwordValidation.errors 
      });
    }

    // الحصول على المستخدم
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'المستخدم غير موجود' 
      });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة' 
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    // تسجيل العملية
    logUserAction(req.user.id, 'password_changed', {
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    logError(error, req, { type: 'change_password_error' });
    next(error);
  }
});

// تسجيل الخروج
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // تسجيل العملية
    logUserAction(req.user.id, 'logout', {
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    logError(error, req, { type: 'logout_error' });
    next(error);
  }
});

module.exports = router;
