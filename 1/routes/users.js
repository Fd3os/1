const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'كلمات المرور الجديدة غير متطابقة' });
    }

    const user = await User.findById(req.user.id);
    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'كلمة المرور القديمة غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
  }
});

module.exports = router;
