const mongoose = require('mongoose');

// 从环境变量或配置文件中获取数据库连接字符串
const getMongoURI = () => {
  // 首先尝试从环境变量获取
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }
  
  // 尝试从配置文件获取（如果使用config模块）
  try {
    const config = require('config');
    return config.get('mongoURI');
  } catch (err) {
    // 默认连接本地MongoDB
    return 'mongodb://localhost:27017/english_game';
  }
};

const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('MongoDB 连接失败:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB 连接已断开');
  } catch (error) {
    console.error(`断开连接失败: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };