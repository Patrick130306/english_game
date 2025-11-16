const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Word = require('../models/Word');
const Deck = require('../models/Deck');

// @route   POST api/words
// @desc    创建新单词
// @access  Private
router.post('/', [
  auth,
  [
    body('word', '单词不能为空').not().isEmpty(),
    body('translation', '翻译不能为空').not().isEmpty()
  ]
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { word, translation, example, pronunciation, deckId } = req.body;
    
    // 创建新单词
    const newWord = new Word({
      word,
      translation,
      example: example || '',
      pronunciation: pronunciation || '',
      user: req.user.id
    });

    // 保存单词
    const savedWord = await newWord.save();

    // 如果指定了单词本，将单词添加到单词本中
    if (deckId) {
      const deck = await Deck.findById(deckId);
      if (deck && deck.user.toString() === req.user.id) {
        deck.words.push(savedWord.id);
        await deck.save();
      }
    }

    res.json(savedWord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/words
// @desc    获取用户的所有单词
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const words = await Word.find({ user: req.user.id }).sort({ date: -1 });
    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/words/:id
// @desc    获取单个单词详情
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const word = await Word.findById(req.params.id);

    if (!word) {
      return res.status(404).json({ message: '单词不存在' });
    }

    // 验证单词是否属于当前用户
    if (word.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    res.json(word);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   PUT api/words/:id
// @desc    更新单词
// @access  Private
router.put('/:id', [
  auth,
  [
    body('word', '单词不能为空').not().isEmpty(),
    body('translation', '翻译不能为空').not().isEmpty()
  ]
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { word, translation, example, pronunciation } = req.body;

    // 查找单词
    let wordDoc = await Word.findById(req.params.id);

    if (!wordDoc) {
      return res.status(404).json({ message: '单词不存在' });
    }

    // 验证单词是否属于当前用户
    if (wordDoc.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 更新单词信息
    wordDoc.word = word;
    wordDoc.translation = translation;
    wordDoc.example = example || '';
    wordDoc.pronunciation = pronunciation || '';

    const updatedWord = await wordDoc.save();
    res.json(updatedWord);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

// @route   DELETE api/words/:id
// @desc    删除单词
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // 查找单词
    const word = await Word.findById(req.params.id);

    if (!word) {
      return res.status(404).json({ message: '单词不存在' });
    }

    // 验证单词是否属于当前用户
    if (word.user.toString() !== req.user.id) {
      return res.status(401).json({ message: '无权访问' });
    }

    // 从所有单词本中移除这个单词
    await Deck.updateMany(
      { words: req.params.id },
      { $pull: { words: req.params.id } }
    );

    // 删除单词
    await word.remove();

    res.json({ message: '单词已删除' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: '单词不存在' });
    }
    res.status(500).send('服务器错误');
  }
});

module.exports = router;