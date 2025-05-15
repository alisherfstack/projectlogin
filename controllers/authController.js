const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Avvaldan mavjud email/username borligini tekshir
    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ msg: 'Email allaqachon ro‘yxatdan o‘tgan' });

    // Parolni hash qilish
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yangi user yaratish
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: 'Foydalanuvchi yaratildi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email orqali userni topish
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email yoki parol noto‘g‘ri' });

    // Parolni tekshirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Email yoki parol noto‘g‘ri' });

    // JWT token yaratish
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Cookie orqali yuborish
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // productionda true bo‘ladi
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
    });

    res.json({ msg: 'Tizimga kirildi', user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie('token').json({ msg: 'Chiqildi' });
};

module.exports = { registerUser, loginUser, logoutUser };
