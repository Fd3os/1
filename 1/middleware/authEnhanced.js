const { logError, logInfo, logUserAction } = require('../utils/logger');

// معالج أخطاء محسن للمصادقة
const authErrorHandler = (error, req, res, next) => {
  logError(error, req, { type: 'authentication_error' });

  // تسجيل محاولة تسجيل دخول فاشلة
  if (req.path.includes('/login')) {
    logUserAction(null, 'login_attempt_failed', {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'البريد الإلكتروني موجود بالفعل'
    });
  }

  res.status(500).json({
    success: false,
    message: 'خطأ في المصادقة'
  });
};

// التحقق من صحة كلمة المرور
const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`كلمة المرور يجب أن تكون على الأقل ${minLength} أحرف`);
  }
  if (!hasLowerCase) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير');
  }
  if (!hasNumbers) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// التحقق من صحة البريد الإلكتروني
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const iraqiDomains = ['.iq', '.com', '.org', '.net'];
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'البريد الإلكتروني غير صالح' };
  }

  const domain = email.split('@')[1];
  const hasValidDomain = iraqiDomains.some(d => domain.endsWith(d)) || 
                        domain.includes('.') ;

  if (!hasValidDomain) {
    return { isValid: false, message: 'البريد الإلكتروني يجب أن ينتمي لنطاق صالح' };
  }

  return { isValid: true };
};

// التحقق من رقم الهاتف العراقي
const validateIraqiPhone = (phone) => {
  // إزالة جميع الأحرف غير الرقمية
  const cleanPhone = phone.replace(/\D/g, '');
  
  // أرقام الهواتف العراقية تبدأ بـ 07 أو 00964
  const iraqiPhoneRegex = /^(07|00964)?[0-9]{9,10}$/;
  
  if (!iraqiPhoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'رقم الهاتف العراقي غير صالح' };
  }

  return { isValid: true };
};

// تسجيل محاولات تسجيل الدخول
const logLoginAttempt = async (req, res, next) => {
  const { email } = req.body;
  
  // تسجيل المحاولة
  logUserAction(null, 'login_attempt', {
    email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  next();
};

// حماية من هجمات القوة الغاشمة
const bruteForceProtection = async (req, res, next) => {
  const { email } = req.body;
  const ip = req.ip;
  
  // هنا يمكن إضافة منطق للتحقق من عدد المحاولات
  // باستخدام Redis أو قاعدة بيانات لتخزين المحاولات
  
  next();
};

module.exports = {
  authErrorHandler,
  validatePassword,
  validateEmail,
  validateIraqiPhone,
  logLoginAttempt,
  bruteForceProtection
};