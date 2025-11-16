const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  settings: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    },
    dailyGoal: {
      type: Number,
      default: 20,
      min: 1,
      max: 100
    },
    language: {
      type: String,
      default: 'zh-CN'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

module.exports = mongoose.model('User', UserSchema);const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  date: {
    type: Date,
    default: Date.now
  },
  settings: {
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    dailyGoal: {
      type: Number,
      default: 20,
      min: 1,
      max: 1000
    },
    language: {
      type: String,
      default: 'zh',
      enum: ['zh', 'en']
    }
  }
});

module.exports = mongoose.model('User', UserSchema);