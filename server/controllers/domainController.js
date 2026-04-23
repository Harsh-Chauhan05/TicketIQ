const Domain = require('../models/Domain');
const { success, error } = require('../utils/apiResponse');

// @desc    Get domain config + rules
// @route   GET /api/domains
const getDomain = async (req, res) => {
  try {
    const domain = await Domain.findOne({ tenantId: req.user.tenantId, name: req.user.domain });
    if (!domain) return error(res, 'Domain configuration not found', 404);
    return success(res, domain);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Add a keyword rule
// @route   POST /api/domains/rules
const addRule = async (req, res) => {
  try {
    const { keyword, priority } = req.body;
    if (!keyword?.trim()) return error(res, 'Keyword is required', 400);
    if (!['critical', 'high', 'medium', 'low'].includes(priority)) {
      return error(res, 'Invalid priority level', 400);
    }

    const domain = await Domain.findOne({ tenantId: req.user.tenantId, name: req.user.domain });
    if (!domain) return error(res, 'Domain not found', 404);

    domain.rules.push({ keyword: keyword.trim(), priority });
    await domain.save();

    return success(res, domain, 'Rule added successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Update a keyword rule
// @route   PUT /api/domains/rules/:ruleId
const updateRule = async (req, res) => {
  try {
    const { keyword, priority } = req.body;
    const domain = await Domain.findOne({ tenantId: req.user.tenantId, name: req.user.domain });
    if (!domain) return error(res, 'Domain not found', 404);

    const rule = domain.rules.id(req.params.ruleId);
    if (!rule) return error(res, 'Rule not found', 404);

    if (keyword) rule.keyword = keyword.trim();
    if (priority) rule.priority = priority;
    await domain.save();

    return success(res, domain, 'Rule updated successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

// @desc    Delete a keyword rule
// @route   DELETE /api/domains/rules/:ruleId
const deleteRule = async (req, res) => {
  try {
    const domain = await Domain.findOne({ tenantId: req.user.tenantId, name: req.user.domain });
    if (!domain) return error(res, 'Domain not found', 404);

    domain.rules = domain.rules.filter(
      (r) => r._id.toString() !== req.params.ruleId
    );
    await domain.save();

    return success(res, domain, 'Rule deleted successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { getDomain, addRule, updateRule, deleteRule };
