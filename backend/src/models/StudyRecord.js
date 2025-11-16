const mongoose = require('mongoose');

const StudyRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0 // 单位：秒
  },
  studyTime: {
    type: Date,
    default: Date.now
  },
  nextReview: {
    type: Date
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  easeFactor: {
    type: Number,
    default: 2.5 // SM-2算法参数
  },
  interval: {
    type: Number,
    default: 0 // 复习间隔天数
  }
});

module.exports = mongoose.model('StudyRecord', StudyRecordSchema);const mongoose = require('mongoose');

const StudyRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  word: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Word',
    required: true
  },
  deck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deck',
    required: true
  },
  lastStudied: {
    type: Date,
    default: Date.now
  },
  nextReview: {
    type: Date,
    default: Date.now
  },
  timesStudied: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  consecutiveCorrect: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // 单位：秒
  },
  // 学习历史记录
  history: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      correct: {
        type: Boolean,
        required: true
      },
      timeSpent: {
        type: Number,
        default: 0
      }
    }
  ]
});

// 索引以提高查询性能
StudyRecordSchema.index({ user: 1, word: 1, deck: 1 }, { unique: true });
StudyRecordSchema.index({ user: 1, nextReview: 1 });

module.exports = mongoose.model('StudyRecord', StudyRecordSchema);