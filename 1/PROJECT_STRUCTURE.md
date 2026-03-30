# 📁 هيكل مشروع متجر الطب العالمي

```
medical-store/
│
├── 📄 server.js                  # نقطة الدخول الرئيسية للـ Backend
├── 📄 package.json               # المكتبات والمتطلبات
├── 📄 .env                       # متغيرات البيئة (محلي)
├── 📄 .env.example              # نموذج متغيرات البيئة
├── 📄 .gitignore                # ملفات لا نرسلها إلى GitHub
├── 📄 Procfile                  # كيفية تشغيل الخادم في الإنتاج
│
├── 📁 models/                   # نماذج قاعدة البيانات
│   ├── User.js                  # نموذج المستخدم
│   ├── Product.js               # نموذج المنتج
│   └── Order.js                 # نموذج الطلب
│
├── 📁 routes/                   # مسارات API
│   ├── auth.js                  # التسجيل وتسجيل الدخول
│   ├── products.js              # إدارة المنتجات
│   ├── orders.js                # إدارة الطلبات
│   ├── payments.js              # معالجة الدفع
│   └── users.js                 # إدارة الملف الشخصي
│
├── 📁 middleware/               # الدوال الوسيطة
│   └── auth.js                  # التحقق من المستخدم
│
├── 📁 public/                   # الملفات الثابتة (الـ Frontend)
│   ├── index.html               # الصفحة الرئيسية
│   ├── about.html               # صفحة عن المتجر
│   ├── products.html            # صفحة المنتجات
│   ├── contact.html             # صفحة التواصل
│   ├── style.css                # تصاميم CSS
│   └── script.js                # البرمجة الأمامية
│
├── 📄 api.js                    # مساعد للاتصال مع API (يستخدم من script.js)
│
├── 📁 img/                      # الصور
│   ├── المستقبل.png
│   └── ...صور أخرى
│
├── 📄 SETUP.md                  # دليل الإعداد المحلي
├── 📄 DEPLOYMENT.md             # دليل النشر الكامل
├── 📄 START_HERE.md             # خطوات النشر السريعة
├── 📄 QUICK_DEPLOY.txt          # ملخص سريع جداً
└── 📄 PROJECT_STRUCTURE.md      # هذا الملف

```

---

## 🔄 كيفية يعمل الموقع:

### Frontend (ما يراه المستخدم):
```
┌─────────────────────────────┐
│   HTML/CSS/JavaScript       │
│   (index.html + script.js)  │
└─────────────────────────────┘
        ↓ (يرسل طلبات)
┌─────────────────────────────┐
│     API Gateway             │
│   (api.js يساعد في التواصل) │
└─────────────────────────────┘
```

### Backend (الخادم):
```
┌─────────────────────────────┐
│     Express Server          │
│     (server.js)             │
└─────────────────────────────┘
        ↓ (يدير العمليات)
┌─────────────────────────────┐
│     Database Models         │
│  (User, Product, Order)     │
└─────────────────────────────┘
        ↓ (يحفظ البيانات)
┌─────────────────────────────┐
│    MongoDB Atlas            │
│   (السحابة - Cloud)        │
└─────────────────────────────┘
```

---

## 📝 ملفات مهمة شرح:

### `server.js` - قلب الخادم
```javascript
// يعرّف الطرق (routes)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
// ...إلخ
```

### `models/User.js` - شكل بيانات المستخدم
```javascript
{
  name: "أحمد محمد",
  email: "ahmed@example.com",
  phone: "+964780203915",
  password: "hashed_password",
  address: { ... },
  role: "user" أو "admin"
}
```

### `models/Product.js` - شكل بيانات المنتج
```javascript
{
  name: "جهاز تخطيط القلب",
  price: 500000,
  image: "url...",
  category: "diagnostic",
  features: [...],
  stock: 10
}
```

### `models/Order.js` - شكل بيانات الطلب
```javascript
{
  orderNumber: "ORD-1234567890-1",
  user: ObjectId,
  items: [{ product, quantity, price }],
  totalAmount: 500000,
  paymentStatus: "pending" | "completed",
  status: "pending" | "shipped" | "delivered"
}
```

---

## 🌐 الـ API Endpoints:

### 🔐 المصادقة
```
POST   /api/auth/register      ← إنشاء حساب
POST   /api/auth/login         ← تسجيل دخول
GET    /api/auth/me            ← معلومات المستخدم الحالي
```

### 📦 المنتجات
```
GET    /api/products           ← جميع المنتجات
GET    /api/products/:id       ← منتج محدد
POST   /api/products           ← إضافة منتج (admin)
PUT    /api/products/:id       ← تعديل منتج (admin)
DELETE /api/products/:id       ← حذف منتج (admin)
```

### 🛒 الطلبات
```
POST   /api/orders             ← إنشاء طلب
GET    /api/orders             ← طلباتي
GET    /api/orders/:id         ← تفاصيل طلب
PUT    /api/orders/:id         ← تحديث حالة الطلب (admin)
```

### 💳 الدفع
```
POST   /api/payments/create-payment-intent
POST   /api/payments/confirm-payment
POST   /api/payments/manual-payment
POST   /api/payments/bank-transfer
```

### 👤 الملف الشخصي
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password
```

---

## 📂 مسارات الملفات:

| الملف | الموقع | الوظيفة |
|------|--------|---------|
| server.js | جذر المشروع | بدء الخادم |
| script.js | public/ | برمجة الموقع |
| style.css | public/ | تصاميم الموقع |
| api.js | جذر المشروع | دوال API |
| User.js | models/ | بيانات المستخدم |
| Product.js | models/ | بيانات المنتج |
| Order.js | models/ | بيانات الطلب |
| auth.js | routes/ | عمليات التسجيل |
| products.js | routes/ | عمليات المنتجات |
| orders.js | routes/ | عمليات الطلبات |
| payments.js | routes/ | عمليات الدفع |

---

## 🔄 مسار طلب الشراء:

```
1. المستخدم ينقر "شراء"
   ↓
2. script.js يستدعي api.orders.create()
   ↓
3. api.js يرسل POST إلى /api/orders
   ↓
4. routes/orders.js يحقق من البيانات
   ↓
5. models/Order.js يحفظ الطلب في MongoDB
   ↓
6. يرسل معرّف الطلب للعميل
   ↓
7. العميل ينقر "ادفع الآن"
   ↓
8. routes/payments.js يعالج الدفع (Stripe أو طرق أخرى)
   ↓
9. تحديث حالة الطلب إلى "completed"
```

---

## 🚀 خطوات التطوير:

### تطوير محلي (على جهازك):
```bash
npm install          # تثبيت المكتبات
npm run dev         # تشغيل مع auto-reload
```
الموقع: `http://localhost:5000`

### نشر أون لاين:
```bash
git add .
git commit -m "message"
git push             # سيتم النشر تلقائياً على Render و Vercel
```

---

## 📊 متغيرات البيئة:

| المتغير | المعنى | المثال |
|--------|---------|---------|
| PORT | منفذ الخادم | 5000 |
| MONGODB_URI | اتصال قاعدة البيانات | mongodb+srv://... |
| JWT_SECRET | مفتاح التشفير | secret_key_123 |
| STRIPE_SECRET_KEY | مفتاح Stripe السري | sk_test_... |
| NODE_ENV | بيئة التطوير/الإنتاج | development/production |

---

## 🎯 الملفات الأساسية للنشر:

✅ `package.json` - المكتبات  
✅ `server.js` - الخادم  
✅ `models/` - نماذج البيانات  
✅ `routes/` - العمليات  
✅ `middleware/` - الأمان  
✅ `public/` - الموقع الأمامي  
✅ `.env` - الإعدادات  
✅ `Procfile` - تعليمات الإنتاج  

---

**الآن أنت جاهز للنشر! 🚀**
