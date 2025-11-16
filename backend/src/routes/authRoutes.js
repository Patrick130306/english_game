const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');

// @route    POST api/auth/register
// @desc     Register a user
// @access   Public
router.post(
  '/register',
  [
    check('username', '用户名至少需要3个字符').isLength({ min: 3 }),
    check('email', '请输入有效的邮箱地址').isEmail(),
    check('password', '密码至少需要6个字符').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // 检查邮箱是否已存在
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: '该邮箱已被注册' });
      }

      // 检查用户名是否已存在
      user = await User.findOne({ username });
      if (user) {
        return res.status(400).json({ msg: '该用户名已被使用' });
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

      await user.save();

      // 返回JWT令牌
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('jwtExpire') || '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  [
    check('email', '请输入有效的邮箱地址').isEmail(),
    check('password', '密码不能为空').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // 查找用户
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: '邮箱或密码错误' });
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: '邮箱或密码错误' });
      }

      // 返回JWT令牌
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('jwtExpire') || '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('服务器错误');
    }
  }
);

// @route    GET api/auth/me
// @desc     Get current user
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

// @route    PUT api/auth/settings
// @desc     Update user settings
// @access   Private
router.put('/settings', auth, async (req, res) => {
  const { theme, dailyGoal, language } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (theme !== undefined) user.settings.theme = theme;
    if (dailyGoal !== undefined) user.settings.dailyGoal = dailyGoal;
    if (language !== undefined) user.settings.language = language;
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;