const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Domain = require('../models/Domain');
const SLAPolicy = require('../models/SLAPolicy');
const { success, error, validationError } = require('../utils/apiResponse');

// Default SLA policies per priority
const DEFAULT_SLA_POLICIES = [
  { priority: 'critical', resolutionTimeMin: 60, escalateAfterMin: 45 },
  { priority: 'high', resolutionTimeMin: 240, escalateAfterMin: 180 },
  { priority: 'medium', resolutionTimeMin: 1440, escalateAfterMin: 1200 },
  { priority: 'low', resolutionTimeMin: 4320, escalateAfterMin: 3600 },
];

// Default rules per domain
const DEFAULT_RULES = {
  banking: [
    { keyword: 'payment failed, transaction failed, payment declined', priority: 'critical' },
    { keyword: 'account locked, account suspended, unauthorized access', priority: 'critical' },
    { keyword: 'money deducted, amount deducted, double charge', priority: 'critical' },
    { keyword: 'wrong balance, missing funds, balance incorrect', priority: 'high' },
    { keyword: 'cannot login, login failed, access denied', priority: 'high' },
    { keyword: 'card blocked, card declined', priority: 'high' },
    { keyword: 'statement incorrect, wrong statement', priority: 'medium' },
    { keyword: 'change address, update details, update email', priority: 'low' },
  ],
  ecommerce: [
    { keyword: 'order not delivered, package missing, never arrived', priority: 'high' },
    { keyword: 'refund not received, money not refunded, refund stuck', priority: 'high' },
    { keyword: 'payment stuck, payment pending, charged not delivered', priority: 'high' },
    { keyword: 'wrong item, incorrect product, damaged product', priority: 'medium' },
    { keyword: 'late delivery, delivery delayed', priority: 'medium' },
    { keyword: 'cancel order, order cancellation', priority: 'medium' },
    { keyword: 'change address, update order', priority: 'low' },
    { keyword: 'track order, where is my order', priority: 'low' },
  ],
  healthcare: [
    { keyword: 'system down, portal not loading, cannot access, server error', priority: 'critical' },
    { keyword: 'patient data missing, records not found, data lost', priority: 'critical' },
    { keyword: 'appointment not confirmed, booking failed', priority: 'high' },
    { keyword: 'prescription not available, medicine not found', priority: 'high' },
    { keyword: 'billing error, invoice wrong, charge incorrect', priority: 'medium' },
    { keyword: 'report not available, test result missing', priority: 'medium' },
    { keyword: 'update profile, change doctor', priority: 'low' },
  ],
  edtech: [
    { keyword: 'exam portal down, cannot submit exam, submission failed', priority: 'critical' },
    { keyword: 'quiz not saving, answers lost, exam crashed', priority: 'critical' },
    { keyword: 'certificate not received, certificate missing', priority: 'high' },
    { keyword: 'payment not confirmed, enrollment failed', priority: 'high' },
    { keyword: 'video not loading, lecture not playing', priority: 'medium' },
    { keyword: 'assignment not submitted, upload failed', priority: 'medium' },
    { keyword: 'course not visible, content missing', priority: 'medium' },
    { keyword: 'change password, update profile', priority: 'low' },
  ],
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array().map(e => ({ field: e.path, message: e.msg })));
    }

    const { name, email, password, role, domain } = req.body;

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return error(res, 'Email already registered', 400);
    }

    // Get or create the Domain document for this domain (used as tenantId)
    let domainDoc = await Domain.findOne({ name: domain, tenantId: { $exists: true } });

    // For MVP: each domain name maps to one shared tenant (domain itself is tenant)
    // We'll find an existing domain doc or create a new one placeholder
    if (!domainDoc) {
      // Create a temporary placeholder domain doc to get its _id as tenantId
      const tempDomain = await Domain.create({
        tenantId: new (require('mongoose').Types.ObjectId)(),
        name: domain,
        rules: DEFAULT_RULES[domain] || [],
      });
      // Use its own _id as tenantId (self-referential for MVP)
      tempDomain.tenantId = tempDomain._id;
      await tempDomain.save();
      domainDoc = tempDomain;

      // Seed SLA policies for this new tenant
      const slaPolicies = DEFAULT_SLA_POLICIES.map(p => ({
        tenantId: domainDoc._id,
        domain,
        ...p,
      }));
      await SLAPolicy.insertMany(slaPolicies, { ordered: false }).catch(() => {});
    }

    const tenantId = domainDoc._id;

    // Generate verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      domain, 
      tenantId,
      verificationToken,
      isVerified: false 
    });

    // Send verification email
    try {
      const { sendEmail, templates } = require('../utils/emailService');
      const emailContent = templates.verifyEmail(user.name, verificationToken);
      await sendEmail({ to: user.email, ...emailContent });
    } catch (e) {
      console.error('Verification email failed:', e.message);
    }

    const token = generateToken(user._id);

    return success(
      res,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          domain: user.domain,
          tenantId: user.tenantId,
        },
      },
      'Registration successful',
      201
    );
  } catch (err) {
    console.error('Register error:', err.message);
    return error(res, 'Server error during registration', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationError(res, errors.array().map(e => ({ field: e.path, message: e.msg })));
    }

    const { email, password } = req.body;

    // Find user + include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return error(res, 'Account deactivated — contact your administrator', 403);
    }

    const token = generateToken(user._id);

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return success(res, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        domain: user.domain,
        tenantId: user.tenantId,
      },
    }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err.message);
    return error(res, 'Server error during login', 500);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    return success(res, {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      domain: req.user.domain,
      tenantId: req.user.tenantId,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) return error(res, 'Email already in use', 400);
      user.email = email;
    }

    await user.save();

    return success(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      domain: user.domain,
      tenantId: user.tenantId,
    }, 'Profile updated successfully');
  } catch (err) {
    console.error('updateMe error:', err.message);
    return error(res, 'Server error', 500);
  }
};

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  return success(res, null, 'Logged out successfully');
};

module.exports = { register, login, getMe, logout, updateMe, DEFAULT_RULES, DEFAULT_SLA_POLICIES };
