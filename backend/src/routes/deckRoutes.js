const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Deck = require('../models/Deck');
const Word = require('../models/Word');

// @route   POST api/decks
// @desc    创建新单词本
// @access  Private
router.post('/', [
  auth,
  [
    body('name', '单词本名称不能为空').not().isEmpty()
  ]
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;
    
    // 创建新单词本
    const newDeck = new Deck({
      name,
      description: description || '',
      words: [],
      user: req.user.id
    });

    const savedDeck = await newDeck.save();
    res.json(savedDeck);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/decks
// @desc    获取用户的所有单词本
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const decks = await Deck.find({ user: req.user.id }).sort({ date: -1 });
    res.json(decks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/decks/:id
// @desc    获取单个单词本详情
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 验证单词本是否属于当前用户
    if (deck.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 加载单词本中的单词详情
    const populatedDeck = await Deck.findById(req.params.id)
      .populate('words', 'word translation example pronunciation');

    res.json(populatedDeck);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/decks/:id
// @desc    更新单词本
// @access  Private
router.put('/:id', [
  auth,
  [
    body('name', '单词本名称不能为空').not().isEmpty()
  ]
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;

    // 查找单词本
    let deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 验证单词本是否属于当前用户
    if (deck.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 更新单词本信息
    deck.name = name;
    deck.description = description || '';

    const updatedDeck = await deck.save();
    res.json(updatedDeck);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/decks/:id
// @desc    删除单词本
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // 查找单词本
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 验证单词本是否属于当前用户
    if (deck.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 删除单词本
    await deck.remove();

    res.json({ message: '单词本已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/decks/:id/words
// @desc    向单词本添加单词
// @access  Private
router.post('/:id/words', auth, async (req, res) => {
  try {
    const { wordId } = req.body;

    // 查找单词本
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 验证单词本是否属于当前用户
    if (deck.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 验证单词是否存在且属于当前用户
    const word = await Word.findOne({
      _id: wordId,
      user: req.user.id
    });

    if (!word) {
      return res.status(404).json({ message: '单词不存在' });
    }

    // 检查单词是否已在单词本中
    if (deck.words.includes(wordId)) {
      return res.status(400).json({ message: '单词已在单词本中' });
    }

    // 添加单词到单词本
    deck.words.push(wordId);
    await deck.save();

    // 加载更新后的单词本（包含单词详情）
    const updatedDeck = await Deck.findById(req.params.id)
      .populate('words', 'word translation example pronunciation');

    res.json(updatedDeck);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本或单词不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/decks/:id/words/:wordId
// @desc    从单词本中移除单词
// @access  Private
router.delete('/:id/words/:wordId', auth, async (req, res) => {
  try {
    // 查找单词本
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ message: '单词本不存在' });
    }

    // 验证单词本是否属于当前用户
    if (deck.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 检查单词是否在单词本中
    if (!deck.words.includes(req.params.wordId)) {
      return res.status(404).json({ message: '单词不在单词本中' });
    }

    // 从单词本中移除单词
    deck.words = deck.words.filter(wordId => wordId.toString() !== req.params.wordId);
    await deck.save();

    // 加载更新后的单词本（包含单词详情）
    const updatedDeck = await Deck.findById(req.params.id)
      .populate('words', 'word translation example pronunciation');

    res.json(updatedDeck);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词本或单词不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

module.exports = router;