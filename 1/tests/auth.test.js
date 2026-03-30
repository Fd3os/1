const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// اختبارات المصادقة
describe('Authentication Tests', () => {
  let testUser;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    const testDB = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/medical-store-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    // تنظيف قاعدة البيانات
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف المستخدمين قبل كل اختبار
    await User.deleteMany({});
  });

  // اختبار تسجيل مستخدم جديد
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        phone: '07801234567',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('تم إنشاء الحساب بنجاح');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'أحمد محمد',
        email: 'invalid-email',
        phone: '07801234567',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('البريد الإلكتروني غير صالح');
    });

    it('should not register user with weak password', async () => {
      const userData = {
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        phone: '07801234567',
        password: '123',
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('كلمة المرور غير صالحة');
    });

    it('should not register user with existing email', async () => {
      // إنشاء مستخدم أولاً
      const user = new User({
        name: 'مستخدم موجود',
        email: 'existing@test.com',
        phone: '07801234567',
        password: 'Test123456'
      });
      await user.save();

      const userData = {
        name: 'أحمد محمد',
        email: 'existing@test.com',
        phone: '07801234568',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('البريد الإلكتروني موجود بالفعل');
    });
  });

  // اختبار تسجيل الدخول
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // إنشاء مستخدم للاختبار
      testUser = new User({
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        phone: '07801234567',
        password: 'Test123456'
      });
      await testUser.save();
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: 'ahmed@test.com',
        password: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('تم تسجيل الدخول بنجاح');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'ahmed@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('بيانات دخول غير صحيحة');
    });

    it('should not login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('بيانات دخول غير صحيحة');
    });
  });

  // اختبار الحصول على بيانات المستخدم
  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      // إنشاء مستخدم والحصول على توكن
      testUser = new User({
        name: 'أحمد محمد',
        email: 'ahmed@test.com',
        phone: '07801234567',
        password: 'Test123456'
      });
      await testUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ahmed@test.com',
          password: 'Test123456'
        });

      token = loginResponse.body.token;
    });

    it('should get user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('ahmed@test.com');
      expect(response.body.user.password).toBeUndefined(); // يجب ألا يكون هناك كلمة مرور
    });

    it('should not get user data without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not get user data with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

// اختبارات المنتجات
describe('Products Tests', () => {
  let testProduct;

  beforeAll(async () => {
    const testDB = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/medical-store-test';
    await mongoose.connect(testDB);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف المنتجات قبل كل اختبار
    await mongoose.connection.db.dropDatabase();
  });

  describe('GET /api/products', () => {
    it('should get empty products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should get products list with data', async () => {
      // إنشاء منتج اختبار
      const Product = require('../models/Product');
      testProduct = new Product({
        name: 'جهاز اختبار',
        description: 'وصف الجهاز',
        price: 100000,
        image: 'test.jpg',
        category: 'diagnostic',
        year: 2023,
        country: 'العراق',
        features: ['ميزة 1', 'ميزة 2']
      });
      await testProduct.save();

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].name).toBe('جهاز اختبار');
      expect(response.body.count).toBe(1);
    });
  });
});

// اختبارات معالجة الأخطاء
describe('Error Handling Tests', () => {
  it('should handle 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('المسار غير موجود');
  });

  it('should handle malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}')
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

// اختبارات الأداء
describe('Performance Tests', () => {
  it('should respond within reasonable time', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/products')
      .expect(200);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // يجب أن يكون الرد أسرع من ثانية واحدة
  });
});

module.exports = {
  // تصدير المتغيرات للاستخدام في اختبارات أخرى
};