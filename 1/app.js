const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const { performanceMonitor, rateLimitHandler } = require('./middleware/errorHandler');

const app = express();

// الأمان
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"]
        }
    }
}));

// الضغط
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// تنظيف البيانات
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// الحماية من XSS
app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        });
    }
    next();
});

// مراقبة الأداء
app.use(performanceMonitor);

// الحد من عدد الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // حد أقصى 100 طلب لكل IP
    message: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// حد أقصى للطلبات الحساسة
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 محاولات تسجيل دخول لكل IP
    message: {
        success: false,
        message: 'تجاوزت عدد محاولات تسجيل الدخول المسموح بها، يرجى المحاولة مرة أخرى بعد 15 دقيقة'
    }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// الملفات الثابتة
app.use(express.static('public'));

// المسارات
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));

// معالجة الأخطاء
app.use(require('./middleware/errorHandler').notFound);
app.use(require('./middleware/errorHandler').errorHandler);

module.exports = app;