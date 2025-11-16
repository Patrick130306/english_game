const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/users/register
// @desc    用户注册
// @access  Public
router.post('/register', [
  body('username', '用户名至少需要3个字符').isLength({ min: 3 }),
  body('email', '请输入有效的邮箱地址').isEmail(),
  body('password', '密码至少需要6个字符').isLength({ min: 6 })
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // 检查用户是否已存在
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 创建新用户
    user = new User({
      username,
      email,
      password
    });

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 保存用户
    await user.save();

    // 创建JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   POST api/users/login
// @desc    用户登录
// @access  Public
router.post('/login', [
  body('email', '请输入有效的邮箱地址').isEmail(),
  body('password', '密码不能为空').exists()
], async (req, res) => {
  // 验证请求数据
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 查找用户
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 创建JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwtSecret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route   GET api/users/me
// @desc    获取当前用户信息
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;