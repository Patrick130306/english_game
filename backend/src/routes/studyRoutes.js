const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Deck = require('../models/Deck');
const Word = require('../models/Word');
const StudyRecord = require('../models/StudyRecord');

// @route   GET api/study/deck/:deckId
// @desc    获取单词本中的单词用于学习
// @access  Private
router.get('/deck/:deckId', auth, async (req, res) => {
  try {
    // 验证单词本是否存在且属于当前用户
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 获取单词本中的所有单词
    const words = await Word.find({
      _id: { $in: deck.words },
      user: req.user.id
    });

    res.json(words);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/study/record
// @desc    记录学习进度
// @access  Private
router.post('/record', auth, async (req, res) => {
  try {
    const { wordId, deckId, correct, timeSpent } = req.body;

    // 验证单词和单词本是否存在且属于当前用户
    const word = await Word.findOne({
      _id: wordId,
      user: req.user.id
    });

    if (!word) {
      return res.status(404).json({ message: '单词不存在' });
    }

    const deck = await Deck.findOne({
      _id: deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 检查是否已有学习记录
    let studyRecord = await StudyRecord.findOne({
      user: req.user.id,
      word: wordId,
      deck: deckId
    });

    if (studyRecord) {
      // 更新现有记录
      studyRecord.lastStudied = Date.now();
      studyRecord.timesStudied += 1;
      studyRecord.timesCorrect += correct ? 1 : 0;
      studyRecord.timeSpent += timeSpent || 0;
      
      // 根据记忆算法更新下次复习时间（简单的间隔重复算法）
      if (correct) {
        // 正确回答，增加间隔
        studyRecord.consecutiveCorrect += 1;
        // 简单实现：正确次数越多，下次复习间隔越长
        const interval = Math.min(365, Math.pow(2, studyRecord.consecutiveCorrect - 1));
        studyRecord.nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
      } else {
        // 错误回答，重置间隔
        studyRecord.consecutiveCorrect = 0;
        studyRecord.nextReview = Date.now(); // 立即复习
      }

      await studyRecord.save();
    } else {
      // 创建新记录
      studyRecord = new StudyRecord({
        user: req.user.id,
        word: wordId,
        deck: deckId,
        lastStudied: Date.now(),
        nextReview: correct ? Date.now() + 24 * 60 * 60 * 1000 : Date.now(), // 正确则明天复习，错误则立即复习
        timesStudied: 1,
        timesCorrect: correct ? 1 : 0,
        consecutiveCorrect: correct ? 1 : 0,
        timeSpent: timeSpent || 0
      });

      await studyRecord.save();
    }

    res.json(studyRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/study/scheduled
// @desc    获取需要复习的单词
// @access  Private
router.get('/scheduled', auth, async (req, res) => {
  try {
    // 获取所有需要复习的单词记录
    const now = Date.now();
    const records = await StudyRecord.find({
      user: req.user.id,
      nextReview: { $lte: now }
    }).populate('word', 'word translation example pronunciation');

    // 提取单词信息
    const wordsToReview = records.map(record => ({
      ...record.word.toObject(),
      recordId: record._id,
      lastStudied: record.lastStudied,
      consecutiveCorrect: record.consecutiveCorrect
    }));

    res.json(wordsToReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/study/stats/:deckId
// @desc    获取单词本学习统计
// @access  Private
router.get('/stats/:deckId', auth, async (req, res) => {
  try {
    // 验证单词本是否存在且属于当前用户
    const deck = await Deck.findOne({
      _id: req.params.deckId,
      user: req.user.id
    });

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 获取单词本的学习记录
    const records = await StudyRecord.find({
      user: req.user.id,
      deck: req.params.deckId
    });

    // 计算统计数据
    const totalWords = deck.words.length;
    const studiedWords = records.length;
    const masteredWords = records.filter(r => r.consecutiveCorrect >= 3).length;
    const todayStudied = records.filter(r => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return r.lastStudied >= yesterday;
    }).length;

    // 计算正确率
    const totalAttempts = records.reduce((sum, r) => sum + r.timesStudied, 0);
    const totalCorrect = records.reduce((sum, r) => sum + r.timesCorrect, 0);
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0;

    const stats = {
      totalWords,
      studiedWords,
      masteredWords,
      todayStudied,
      accuracy,
      averageTimeSpent: totalAttempts > 0 ? records.reduce((sum, r) => sum + r.timeSpent, 0) / totalAttempts : 0
    };

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

module.exports = router;