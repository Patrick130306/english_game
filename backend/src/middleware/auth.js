const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // 从请求头获取token
  const token = req.header('x-auth-token');

  // 检查是否有token
  if (!token) {
    return res.status(401).json({ msg: '没有令牌，访问被拒绝' });
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    
    // 将用户信息添加到请求对象中
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: '令牌无效' });
  }
};const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 从请求头获取令牌
  const token = req.header('x-auth-token');

  // 检查是否有令牌
  if (!token) {
    return res.status(401).json({ message: '没有授权令牌，访问被拒绝' });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtSecret');
    
    // 将用户信息添加到请求中
    req.user = decoded.user;
    next();
  } catch (err) {
    // 令牌无效
    res.status(401).json({ message: '令牌无效，访问被拒绝' });
  }
};