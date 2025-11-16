const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  words: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  lastStudied: {
    type: Date,
    default: Date.now
  },
  studyCount: {
    type: Number,
    default: 0
  }
});

// 在保存前更新 lastStudied
DeckSchema.pre('save', function(next) {
  // 只有在添加或移除单词时才更新 lastStudied
  if (this.isModified('words')) {
    this.lastStudied = Date.now();
  }
  next();
});

module.exports = mongoose.model('Deck', DeckSchema);