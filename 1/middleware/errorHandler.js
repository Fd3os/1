const { logError, logInfo } = require('../utils/logger');

// معالج أخطاء مركزي
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // تسجيل الخطأ
    logError(err, req, {
        statusCode: err.statusCode || 500,
        stack: err.stack
    });

    // خطأ في قاعدة البيانات - تكرار البيانات
    if (err.code === 11000) {
        const message = 'هذه البيانات موجودة بالفعل';
        error = { message, statusCode: 400 };
    }

    // خطأ في التحقق من البيانات
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // خطأ في JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'رمز المصادقة غير صالح';
        error = { message, statusCode: 401 };
    }

    // خطأ في انتهاء صلاحية JWT
    if (err.name === 'TokenExpiredError') {
        const message = 'انتهت صلاحية رمز المصادقة';
        error = { message, statusCode: 401 };
    }

    // خطأ في الاتصال بقاعدة البيانات
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        const message = 'خطأ في الاتصال بقاعدة البيانات';
        error = { message, statusCode: 500 };
    }

    // خطأ في تحويل ObjectId
    if (err.name === 'CastError') {
        const message = 'المعرف غير صالح';
        error = { message, statusCode: 400 };
    }

    // خطأ في حجم الملف
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'حجم الملف يتجاوز الحد المسموح به';
        error = { message, statusCode: 400 };
    }

    // خطأ في الشبكة
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        const message = 'خطأ في الاتصال بالخادم';
        error = { message, statusCode: 503 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'حدث خطأ في الخادم',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// معالج المسارات غير الموجودة
const notFound = (req, res, next) => {
    const error = new Error(`المسار غير موجود: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// معالج أخطاء غير متوقعة
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// التحقق من صحة البيانات
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                message: 'خطأ في التحقق من البيانات',
                details: message
            });
        }
        next();
    };
};

// معالج أخطاء الدفع
const paymentErrorHandler = (error, req, res, next) => {
    logError(error, req, { type: 'payment_error' });

    // أخطاء Stripe الشائعة
    if (error.type === 'StripeCardError') {
        return res.status(400).json({
            success: false,
            message: 'بيانات البطاقة غير صحيحة',
            code: error.code
        });
    }

    if (error.type === 'StripeRateLimitError') {
        return res.status(429).json({
            success: false,
            message: 'تجاوزت عدد المحاولات المسموح بها، يرجى المحاولة مرة أخرى لاحقاً'
        });
    }

    if (error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
            success: false,
            message: 'طلب غير صالح'
        });
    }

    if (error.type === 'StripeAPIError') {
        return res.status(500).json({
            success: false,
            message: 'خطأ في نظام الدفع، يرجى المحاولة مرة أخرى'
        });
    }

    if (error.type === 'StripeConnectionError') {
        return res.status(503).json({
            success: false,
            message: 'لا يمكن الاتصال بنظام الدفع، يرجى المحاولة مرة أخرى'
        });
    }

    if (error.type === 'StripeAuthenticationError') {
        return res.status(500).json({
            success: false,
            message: 'خطأ في مصادقة نظام الدفع'
        });
    }

    next(error);
};

// معالج أخطاء الملفات
const fileErrorHandler = (error, req, res, next) => {
    logError(error, req, { type: 'file_error' });

    if (error.code === 'ENOENT') {
        return res.status(404).json({
            success: false,
            message: 'الملف غير موجود'
        });
    }

    if (error.code === 'EACCES') {
        return res.status(403).json({
            success: false,
            message: 'لا يوجد إذن للوصول إلى الملف'
        });
    }

    next(error);
};

// مراقبة الأداء
const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        if (duration > 3000) { // إذا استغرق الطلب أكثر من 3 ثوانٍ
            logInfo('Slow Request Detected', {
                url: req.url,
                method: req.method,
                duration: `${duration}ms`,
                statusCode: res.statusCode
            });
        }
    });
    
    next();
};

// الحد من عدد الطلبات
const rateLimitHandler = (req, res) => {
    logInfo('Rate Limit Exceeded', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
        success: false,
        message: 'تجاوزت عدد الطلبات المسموح بها، يرجى المحاولة مرة أخرى بعد دقيقة'
    });
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler,
    validateRequest,
    paymentErrorHandler,
    fileErrorHandler,
    performanceMonitor,
    rateLimitHandler
};