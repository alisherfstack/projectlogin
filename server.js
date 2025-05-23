const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express(); // ✅ AVVAL app yaratamiz

app.use(cors);
dotenv.config();
// Middleware
app.use(express.json());
app.use(cookieParser());

// ROUTES
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Route test
app.get('/', (req, res) => {
  res.send('API ishlayapti!');
});

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB ulandi');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server ${process.env.PORT || 5000} portda ishlayapti`);
  });
})
.catch((err) => {
  console.error('MongoDB ulanish xatosi:', err);
});
