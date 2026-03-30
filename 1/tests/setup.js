// إعداد Jest للاختبارات
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// قبل جميع الاختبارات
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

// بعد جميع الاختبارات
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// قبل كل اختبار
beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// تعطيل السجلات أثناء الاختبارات
console.log = jest.fn();
console.error = jest.fn();