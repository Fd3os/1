#!/bin/bash

# سكربت النشر التلقائي لمتجر الطب العالمي

echo "🚀 بدء عملية النشر لمتجر الطب العالمي..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً."
    exit 1
fi

# إنشاء مجلد السجلات
echo "📁 إنشاء مجلد السجلات..."
mkdir -p logs

# تثبيت الاعتماديات
echo "📦 تثبيت الاعتماديات..."
npm install

# تشغيل الاختبارات
echo "🧪 تشغيل الاختبارات..."
if npm test; then
    echo "✅ جميع الاختبارات نجحت"
else
    echo "❌ فشلت بعض الاختبارات"
    echo "🔄 المتابعة في النشر على أي حال..."
fi

# بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# التحقق من متغيرات البيئة
echo "🔍 التحقق من متغيرات البيئة..."
if [ ! -f .env ]; then
    echo "⚠️  ملف .env غير موجود. إنشاء ملف افتراضي..."
    cat > .env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-store
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
FRONTEND_URL=http://localhost:3000
EOF
    echo "⚠️  يرجى تحديث ملف .env بالقيم الصحيحة"
fi

# بدء الخادم
echo "🌐 بدء الخادم..."
if command -v pm2 &> /dev/null; then
    echo "📋 استخدام PM2 لإدارة العملية..."
    pm2 stop medical-store 2>/dev/null || true
    pm2 delete medical-store 2>/dev/null || true
    pm2 start server.js --name medical-store
    pm2 save
    pm2 startup
    echo "✅ تم بدء الخادم باستخدام PM2"
    echo "📊 حالة الخادم:"
    pm2 status
    echo "📝 سجلات الخادم:"
    pm2 logs medical-store
else
    echo "🔄 بدء الخادم مباشرة..."
    npm start
fi

echo "🎉 اكتملت عملية النشر!"
echo "🌐 الموقع متاح على: http://localhost:5000"
echo "📊 للتحقق من حالة الخادم: pm2 status"
echo "📝 لعرض السجلات: pm2 logs medical-store"
echo "🛑 لإيقاف الخادم: pm2 stop medical-store"