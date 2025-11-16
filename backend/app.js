const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./src/config/db');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 导入中间件和路由
  const authRoutes = require('./src/routes/authRoutes');
  const wordRoutes = require('./src/routes/wordRoutes');
  const deckRoutes = require('./src/routes/deckRoutes');
  const studyRoutes = require('./src/routes/studyRoutes');
  const auth = require('./src/middleware/auth');

  // 使用路由
  app.use('/api/auth', authRoutes);
  app.use('/api/words', wordRoutes);
  app.use('/api/decks', deckRoutes);
  app.use('/api/study', studyRoutes);
connectDB();

// 静态文件服务（用于生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误', error: process.env.NODE_ENV === 'development' ? err.message : null });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;