# 🏥 متجر الطب العالمي

منصة تجارة إلكترونية متكاملة لبيع الأجهزة الطبية مع:
- ✅ **نظام المصادقة الآمن** (JWT)
- ✅ **قاعدة بيانات** (MongoDB)
- ✅ **نظام الطلبات** المتطور
- ✅ **معالجة الدفع** (Stripe + طرق أخرى)
- ✅ **إدارة المنتجات** والمخزون

---

## 🚀 البدء السريع (3 خطوات!)

### ⚡ النشر أون لاين (خيار موصى به)
👉 **اقرأ:** [`START_HERE.md`](./START_HERE.md) - 15 دقيقة فقط!

### 💻 التطوير المحلي
```bash
# 1. تثبيت المتطلبات
npm install

# 2. تشغيل الخادم
npm run dev

# 3. افتح الموقع
http://localhost:5000
```

---

## 📋 المحتويات

| الملف | الوصف |
|------|--------|
| **START_HERE.md** | 👈 **ابدأ من هنا!** خطوات النشر الأون لاين |
| **SETUP.md** | دليل الإعداد المحلي الكامل |
| **DEPLOYMENT.md** | دليل النشر التفصيلي |
| **PROJECT_STRUCTURE.md** | شرح هيكل المشروع |
| **QUICK_DEPLOY.txt** | ملخص سريع جداً |

---

## 🛠️ المتطلبات

### للتطوير المحلي:
- **Node.js** (v18+)
- **npm** أو **yarn**
- **MongoDB** (محلي أو MongoDB Atlas)
- **Git**

### للنشر أون لاين:
- **GitHub Account** (مجاني)
- **Render Account** (مجاني)
- **Vercel Account** (مجاني)
- **MongoDB Atlas Account** (مجاني)

---

## 📁 الهيكل الأساسي

```
medical-store/
├── server.js                    # نقطة الدخول الرئيسية
├── models/                      # نماذج البيانات
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/                      # مسارات API
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── payments.js
│   └── users.js
├── middleware/                  # الأمان والتحقق
│   └── auth.js
├── public/                      # الموقع الأمامي
│   ├── *.html
│   ├── style.css
│   └── script.js
└── api.js                       # مساعد للاتصال
```

---

## 🌐 API Endpoints

### 🔐 المصادقة
```
POST   /api/auth/register       # إنشاء حساب جديد
POST   /api/auth/login          # تسجيل الدخول
GET    /api/auth/me             # معلومات المستخدم
```

### 📦 المنتجات
```
GET    /api/products            # جميع المنتجات
GET    /api/products/:id        # منتج محدد
POST   /api/products            # إضافة منتج (admin)
PUT    /api/products/:id        # تعديل منتج (admin)
DELETE /api/products/:id        # حذف منتج (admin)
```

### 🛒 الطلبات
```
POST   /api/orders              # إنشاء طلب
GET    /api/orders              # طلباتي
GET    /api/orders/:id          # تفاصيل طلب
PUT    /api/orders/:id          # تحديث الطلب (admin)
```

### 💳 الدفع
```
POST   /api/payments/create-payment-intent     # Stripe
POST   /api/payments/confirm-payment           # تأكيد
POST   /api/payments/manual-payment            # يدوي
POST   /api/payments/bank-transfer             # تحويل
```

### 👤 الملف الشخصي
```
GET    /api/users/profile       # الملف الشخصي
PUT    /api/users/profile       # تحديث البيانات
PUT    /api/users/change-password  # تغيير كلمة المرور
```

---

## 🔐 الأمان

- ✅ **كلمات مرور مشفرة** باستخدام bcryptjs
- ✅ **JWT Tokens** للمصادقة
- ✅ **CORS** مفعل
- ✅ **Helmet** لحماية الـ Headers
- ✅ **بيانات حساسة** لا تُحفظ في localStorage

---

## 📝 متغيرات البيئة

انسخ `.env.example` إلى `.env` وأكمل البيانات:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development
```

---

## 💾 قاعدة البيانات

### MongoDB Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  address: Object,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  category: "diagnostic" | "imaging" | "treatment" | "lab",
  rating: Number (0-5),
  ratingCount: Number,
  features: Array<String>,
  stock: Number,
  inStock: Boolean,
  createdAt: Date
}
```

#### Orders
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: Array<{product, quantity, price}>,
  totalAmount: Number,
  paymentStatus: "pending" | "completed" | "failed",
  paymentMethod: "credit_card" | "bank_transfer" | "e_wallet",
  status: "pending" | "processing" | "shipped" | "delivered",
  shippingAddress: Object,
  createdAt: Date
}
```

---

## 🧪 الاختبار

### تسجيل حساب جديد
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "phone": "+964780203915",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### الحصول على المنتجات
```bash
curl http://localhost:5000/api/products
```

### إنشاء طلب (يتطلب توكن)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 2}],
    "paymentMethod": "credit_card",
    "shippingAddress": {...}
  }'
```

---

## 🚀 النشر

### الخيار 1: نشر كامل (موصى به)
```
👉 اقرأ: START_HERE.md
```

### الخيار 2: نشر يدوي
```
👉 اقرأ: DEPLOYMENT.md
```

### الخيار 3: إعداد محلي
```
👉 اقرأ: SETUP.md
```

---

## 📊 الأداء

- ⚡ **Frontend:** Vercel CDN (سريع جداً)
- ⚡ **Backend:** Render (تشغيل 24/7)
- ⚡ **Database:** MongoDB (استجابة سريعة)
- ⚡ **Security:** Cloudflare (إضافي)

---

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing`)
5. فتح Pull Request

---

## 📞 الدعم

للمساعدة:
- 📖 اقرأ الأدلة: `START_HERE.md` أو `DEPLOYMENT.md`
- 🐛 تحقق من الأخطاء في الـ Console (F12)
- 🔗 راجع Render/Vercel Dashboard للـ Logs

---

## 📄 الترخيص

MIT License - انظر LICENSE file

---

## ✨ الميزات القادمة

- [ ] لوحة إدارة Admin
- [ ] نظام التقييمات والتعليقات
- [ ] نظام الخصومات والكوبونات
- [ ] تطبيق Mobile
- [ ] نظام البريد الإلكتروني الآلي
- [ ] نظام تتبع الطلبات في الوقت الفعلي

---

## 🎉 شكراً لاستخدام متجر الطب العالمي!

**موقعك أون لاين الآن** 🚀

```
Website: https://your-site.vercel.app
API:     https://medical-store-api.onrender.com
```

---

*آخر تحديث: December 2024*
