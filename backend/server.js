const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint kiểm tra trạng thái dịch vụ (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend API Quan ly nhan su dang hoat dong',
    healthCheck: '/health',
    employeesEndpoint: '/api/employees'
  });
});

// Employee Routes
app.use('/api/employees', employeeRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint khong ton tai'
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/238244_NguyenQuocHuy';

// Kết nối MongoDB và khởi động server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Da ket noi thanh cong MongoDB Atlas!');
    app.listen(PORT, () => {
      console.log(`Server dang chay tren cong: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Loi ket noi MongoDB Atlas:', err.message);
    // Vẫn lắng nghe để có thể test health check
    app.listen(PORT, () => {
      console.log(`Server dang chay tren cong ${PORT} (chua ket noi duoc Database)`);
    });
  });

