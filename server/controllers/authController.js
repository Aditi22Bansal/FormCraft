const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, fail } = require('../utils/apiResponse');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return fail(res, 'Name, email, and password are required');
    if (password.length < 6) return fail(res, 'Password must be at least 6 characters');

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return fail(res, 'Email already registered');

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role });

    return success(res, { token: signToken(user._id), user: formatUser(user) }, 'Account created', 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password are required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return fail(res, 'Invalid email or password', 401);
    }

    return success(res, { token: signToken(user._id), user: formatUser(user) }, 'Logged in');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

exports.me = async (req, res) => {
  return success(res, { user: formatUser(req.user) });
};
