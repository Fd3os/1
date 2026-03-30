const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'السلة فارغة' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `المنتج ${item.productId} غير موجود` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `المخزون غير كافي للمنتج ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress
    });

    await order.save();
    await order.populate('items.product');

    res.status(201).json({
      message: 'تم إنشاء الطلب بنجاح',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'لا يمكنك الوصول إلى هذا الطلب' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

module.exports = router;
