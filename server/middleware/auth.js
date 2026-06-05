const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return fail(res, 'Not authorized', 401);

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return fail(res, 'User not found', 401);

    req.user = user;
    next();
  } catch {
    return fail(res, 'Not authorized', 401);
  }
};

const canAccessForm = (form, user) =>
  user.role === 'admin' || form.createdBy.toString() === user._id.toString();

module.exports = { protect, canAccessForm };
