const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'لا يمكنك الوصول إلى هذا الطلب' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      metadata: { orderId: orderId }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في معالجة الدفع', error: error.message });
  }
});

router.post('/confirm-payment', authenticate, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'completed' },
        { new: true }
      );

      res.json({
        message: 'تمت عملية الدفع بنجاح',
        order
      });
    } else {
      res.status(400).json({ message: 'فشلت عملية الدفع' });
    }
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تأكيد الدفع', error: error.message });
  }
});

router.post('/manual-payment', authenticate, async (req, res) => {
  try {
    const { orderId, cardDetails } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'لا يمكنك الوصول إلى هذا الطلب' });
    }

    if (!cardDetails || !cardDetails.number || !cardDetails.name) {
      return res.status(400).json({ message: 'بيانات البطاقة غير كاملة' });
    }

    const order_updated = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'pending' },
      { new: true }
    );

    res.json({
      message: 'تم استقبال بيانات البطاقة. سيتم معالجة الدفع قريباً',
      order: order_updated
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في معالجة الدفع', error: error.message });
  }
});

router.post('/bank-transfer', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'pending' },
      { new: true }
    );

    res.json({
      message: 'تم إنشاء طلب التحويل البنكي',
      bankDetails: {
        bankName: 'البنك الأهلي العراقي',
        accountNumber: '1234567890',
        iban: 'IQ21NBIQ1234567890'
      },
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في معالجة الدفع', error: error.message });
  }
});

module.exports = router;
