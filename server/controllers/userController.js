const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// @desc    Get all users in tenant
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    return success(res, users);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    }).select('-password');
    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Update user info
// @route   PATCH /api/users/:id
const updateUser = async (req, res) => {
  try {
    const allowed = ['name', 'role'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return error(res, 'User not found', 404);
    return success(res, user, 'User updated');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Toggle user active/inactive
// @route   PATCH /api/users/:id/toggle
const toggleActive = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return error(res, 'User not found', 404);

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return error(res, 'Cannot deactivate your own account', 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return success(
      res,
      { _id: user._id, isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    if (!user) return error(res, 'User not found', 404);
    return success(res, null, 'User deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { getUsers, getUser, updateUser, toggleActive, deleteUser };
