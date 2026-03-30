# متجر الطب العالمي - دليل الإعداد

## المتطلبات
- Node.js (v14 أو أحدث)
- MongoDB (محلي أو cloud)
- Stripe Account (للدفع بالبطاقات)

## خطوات الإعداد

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد قاعدة البيانات MongoDB
اختر أحد الخيارات:

**Option A: MongoDB محلي**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- أنشئ حساب على https://www.mongodb.com/cloud/atlas
- انسخ connection string وضعها في `.env`

### 3. إعداد ملف البيئة `.env`
أضف المتغيرات التالية إلى ملف `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-store
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
NODE_ENV=development
```

للحصول على مفاتيح Stripe:
1. أنشئ حساب على https://stripe.com
2. انسخ المفاتيح من Dashboard → API Keys

### 4. تشغيل الخادم
```bash
npm start
```

أو للتطوير مع auto-reload:
```bash
npm run dev
```

الخادم سيعمل على: `http://localhost:5000`

### 5. تهيئة بيانات المنتجات
استخدم MongoDB Compass أو أضف المنتجات عبر API:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "جهاز تخطيط القلب ECJ",
    "description": "جهاز تخطيط القلب حديث",
    "price": 500000,
    "image": "https://...",
    "category": "diagnostic",
    "year": 2023,
    "country": "ألمانيا",
    "features": ["ميزة 1", "ميزة 2"],
    "stock": 10
  }'
```

## API الأساسية

### المصادقة
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - الحصول على معلومات المستخدم

### المنتجات
- `GET /api/products` - الحصول على جميع المنتجات
- `GET /api/products/:id` - الحصول على منتج محدد
- `POST /api/products` - إضافة منتج (admin فقط)
- `PUT /api/products/:id` - تعديل منتج (admin فقط)
- `DELETE /api/products/:id` - حذف منتج (admin فقط)

### الطلبات
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders` - الحصول على طلباتي
- `GET /api/orders/:id` - الحصول على تفاصيل طلب
- `PUT /api/orders/:id` - تحديث حالة الطلب (admin فقط)

### الدفع
- `POST /api/payments/create-payment-intent` - إنشاء نية دفع (Stripe)
- `POST /api/payments/confirm-payment` - تأكيد الدفع
- `POST /api/payments/manual-payment` - دفع يدوي
- `POST /api/payments/bank-transfer` - تحويل بنكي

### المستخدم
- `GET /api/users/profile` - الحصول على الملف الشخصي
- `PUT /api/users/profile` - تحديث الملف الشخصي
- `PUT /api/users/change-password` - تغيير كلمة المرور

## الاتصال من Frontend

استخدم ملف `api.js` المرفق:

```javascript
// التسجيل
const result = await api.auth.register({
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+964780203915',
  password: 'password123',
  confirmPassword: 'password123'
});

// تسجيل الدخول
const login = await api.auth.login({
  email: 'ahmed@example.com',
  password: 'password123'
});

// الحصول على المنتجات
const products = await api.products.getAll();

// إنشاء طلب
const order = await api.orders.create({
  items: [
    { productId: 'product_id_1', quantity: 2 },
    { productId: 'product_id_2', quantity: 1 }
  ],
  paymentMethod: 'credit_card',
  shippingAddress: {
    street: 'شارع رئيسي',
    city: 'بغداد',
    governorate: 'بغداد',
    postalCode: '10001'
  }
});
```

## هيكل المشروع

```
medical-store/
├── models/              # نماذج قاعدة البيانات
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/              # مسارات API
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── users.js
│   └── payments.js
├── middleware/          # middleware الوسطية
│   └── auth.js
├── public/              # الملفات الثابتة (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js            # نقطة الدخول الرئيسية
├── api.js               # مساعد للاتصال مع API
├── package.json
├── .env                 # متغيرات البيئة
└── SETUP.md            # هذا الملف

```

## استكشاف الأخطاء

### MongoDB غير متصل
```
MongoNetworkError: connect ECONNREFUSED
```
**الحل**: تأكد من تشغيل MongoDB أو تحديث connection string في `.env`

### JWT غير صحيح
```
401 Unauthorized: Invalid token
```
**الحل**: تأكد من إرسال token في header مع البادئة `Bearer`

### Stripe key غير صحيح
```
401 Unauthorized: Invalid API Key
```
**الحل**: تحقق من مفاتيح Stripe في `.env`

## الخطوات التالية

1. ربط Frontend مع Backend (تحديث script.js)
2. إضافة نظام إدارة المنتجات (Admin Panel)
3. إضافة نظام تتبع الطلبات
4. تحسينات الأمان والتشفير
5. اختبار شامل للعمليات

---

للمزيد من المساعدة، راجع التوثيق الرسمية:
- Express: https://expressjs.com
- Mongoose: https://mongoosejs.com
- Stripe: https://stripe.com/docs
