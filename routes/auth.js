const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register endpoint (sizda bor)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email allaqachon ro‘yxatdan o‘tgan' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Foydalanuvchi yaratildi!' });
  } catch (err) {
    res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
  }
});

// Login endpoint (yangi qo'shilyapti)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Email yoki parol noto‘g‘ri' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki parol noto‘g‘ri' });
    }

    // JWT token yaratish
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Tizimga kirildi', token, user: { username: user.username, email: user.email } });
    res.send("Registered Successfullyy!!!!")
  } catch (err) {
    res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
  }
});

module.exports = router;
