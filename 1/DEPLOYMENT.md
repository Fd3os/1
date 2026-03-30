# نشر متجر الطب العالمي أون لاين 🚀

## المتطلبات

- حساب GitHub
- حساب Vercel (مجاني)
- حساب Render (مجاني) أو Railway
- حساب MongoDB Atlas (مجاني)

---

## الخطوة 1️⃣: إعداد MongoDB Atlas (قاعدة البيانات السحابية)

### 1. أنشئ حساب على MongoDB Atlas
```
https://www.mongodb.com/cloud/atlas/register
```

### 2. أنشئ Cluster جديد
- اختر **Free Tier**
- اختر Region قريبة من المستخدمين (يفضل: **Ireland** أو **Frankfurt** للشرق الأوسط)
- انقر **Create Cluster**

### 3. أنشئ Database User
- اذهب إلى **Database Access**
- اضغط **Add New Database User**
- أدخل:
  - Username: `medical_store`
  - Password: `your_strong_password_here`
- اضغط **Create Database User**

### 4. احصل على Connection String
- اذهب إلى **Clusters** → اضغط **Connect**
- اختر **Connect your application**
- انسخ Connection String:
```
mongodb+srv://medical_store:your_password@cluster.mongodb.net/medical-store?retryWrites=true&w=majority
```

⚠️ **استبدل `your_password` برمز المرور الذي أنشأته**

---

## الخطوة 2️⃣: نشر Backend على Render

### 1. ادفع الكود إلى GitHub
```bash
git init
git add .
git commit -m "Initial commit: Medical Store Backend"
git branch -M main
git remote add origin https://github.com/your-username/medical-store.git
git push -u origin main
```

### 2. أنشئ حساب Render
```
https://render.com/register
```

### 3. انشئ Web Service جديد
- اذهب إلى **Dashboard** → **New +** → **Web Service**
- اختر GitHub repository الخاص بك
- أدخل الإعدادات التالية:

```
Name: medical-store-api
Environment: Node
Region: Frankfurt (Europe) أو الأقرب لديك
Branch: main
Build Command: npm install
Start Command: npm start
```

### 4. أضف متغيرات البيئة (Environment Variables)
في إعدادات Render، أضف:

```
PORT=5000
MONGODB_URI=mongodb+srv://medical_store:YOUR_PASSWORD@cluster.mongodb.net/medical-store?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
NODE_ENV=production
```

### 5. اضغط **Create Web Service**

✅ **Backend سيكون أون لاين على:**
```
https://medical-store-api.onrender.com
```

---

## الخطوة 3️⃣: تحديث Frontend للاتصال مع Backend الأون لاين

### 1. عدّل ملف `api.js`

غيّر السطر الأول من:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

إلى:
```javascript
const API_BASE_URL = 'https://medical-store-api.onrender.com/api';
```

### 2. حدّث في `script.js` أيضاً (إن وجد)
ابحث عن أي URLs محلية وغيّرها إلى URLs الأون لاين.

---

## الخطوة 4️⃣: نشر Frontend على Vercel

### 1. أنشئ حساب Vercel
```
https://vercel.com/signup
```

### 2. اربط GitHub
- في Vercel، اضغط **Import Project**
- اختر GitHub repository الخاص بك
- اضغط **Import**

### 3. أعدادات الـ Project
```
Framework Preset: Other
Root Directory: . (جذر المشروع)
```

### 4. أضف متغيرات البيئة (اختياري)
```
VITE_API_URL=https://medical-store-api.onrender.com/api
```

### 5. اضغط **Deploy**

✅ **Frontend سيكون أون لاين على:**
```
https://your-project-name.vercel.app
```

---

## الخطوة 5️⃣: نشر قاعدة البيانات الأولية

### إضافة بيانات المنتجات

استخدم MongoDB Compass أو MongoDB Atlas Web UI:

```bash
curl -X POST https://medical-store-api.onrender.com/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "جهاز تخطيط القلب ECJ",
    "description": "جهاز تخطيط القلب حديث مع شاشة لمس",
    "price": 500000,
    "image": "https://cdn.altibbi.com/cdn/cache/1000x500/image/2020/03/12/742d13dea638d95c0f156816befc050f.png.webp",
    "category": "diagnostic",
    "year": 2023,
    "country": "ألمانيا",
    "features": ["12 قناة تخطيط قلب", "شاشة لمس 10 بوصة"],
    "stock": 10,
    "rating": 4.5,
    "ratingCount": 24
  }'
```

---

## ✅ الموقع جاهز!

**الآن لديك:**
- 🌐 Frontend على: `https://your-project.vercel.app`
- 🔗 Backend API على: `https://medical-store-api.onrender.com`
- 💾 قاعدة بيانات على: MongoDB Atlas

---

## 🔗 ربط النطاق الخاص بك (اختياري)

### نطاق مجاني
```
https://your-free-domain.tk (Freenom)
```

### نطاق مدفوع
```
استخدم Namecheap أو GoDaddy
```

### ربط النطاق مع Vercel
1. اشتري النطاق
2. في Vercel → Project Settings → Domains
3. أضف النطاق الخاص بك
4. اتبع التعليمات لربط DNS

---

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot connect to MongoDB"
- **الحل**: تحقق من Connection String و IP Whitelist في MongoDB Atlas

### خطأ: "CORS error"
- **الحل**: تأكد من تفعيل CORS في server.js

### خطأ: "Build failed on Render"
- **الحل**: 
  - تأكد من `package.json` موجود
  - تأكد من `npm install` يعمل محلياً أولاً
  - راجع Build logs على Render dashboard

---

## 📊 مراقبة الموقع

### Render Dashboard
```
https://dashboard.render.com
```
- راقب الـ Logs
- تابع استهلاك الموارد

### Vercel Analytics
```
https://vercel.com/dashboard
```
- مشاهدة عدد الزيارات
- الأداء والـ Load Times

### MongoDB Atlas Metrics
```
https://cloud.mongodb.com
```
- حجم البيانات
- عدد الـ Queries

---

## 🚀 الخطوات التالية

1. أضف **Google Analytics** لتتبع الزيارات
2. أضف **Cloudflare** لـ CDN وتسريع الموقع
3. أضف **SSL Certificate** (Vercel و Render يضيفانه تلقائياً)
4. استخدم **PM2** على Render لـ auto-restart
5. أضف **Backup Strategy** لـ MongoDB

---

**للمزيد من المساعدة:**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
