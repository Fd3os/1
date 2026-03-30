const winston = require('winston');
const path = require('path');

// إنشاء مجلد للسجلات إذا لم يكن موجوداً
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// إعداد نظام التسجيل
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'medical-store' },
    transports: [
        // تسجيل الأخطاء في ملف منفصل
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // تسجيل جميع المعلومات في ملف منفصل
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// في بيئة التطوير، أضف التسجيل في الكونسول
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// دالة لتسجيل الأخطاء المخصصة
const logError = (error, req = null, additionalInfo = {}) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        ...additionalInfo
    };

    if (req) {
        errorData.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            body: req.body,
            params: req.params,
            query: req.query
        };
    }

    logger.error('Application Error', errorData);
};

// دالة لتسجيل المعلومات
const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

// دالة لتسجيل تحذيرات
const logWarning = (message, meta = {}) => {
    logger.warn(message, meta);
};

// دالة لتسجيل عمليات المستخدمين
const logUserAction = (userId, action, details = {}) => {
    logger.info('User Action', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

// دالة لتسجيل عمليات الدفع
const logPayment = (orderId, paymentData, status) => {
    logger.info('Payment Process', {
        orderId,
        paymentData: {
            amount: paymentData.amount,
            currency: paymentData.currency,
            method: paymentData.method
            // لا تسجل بيانات البطاقة الحساسة
        },
        status,
        timestamp: new Date().toISOString()
    });
};

// دالة لتسجيل أخطاء قاعدة البيانات
const logDatabaseError = (error, operation, collection) => {
    logger.error('Database Error', {
        message: error.message,
        stack: error.stack,
        operation,
        collection,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    logger,
    logError,
    logInfo,
    logWarning,
    logUserAction,
    logPayment,
    logDatabaseError
};