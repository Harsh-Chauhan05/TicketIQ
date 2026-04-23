const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Domain = require('../models/Domain');
const SLAPolicy = require('../models/SLAPolicy');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DEFAULT_SLA_POLICIES = [
  { priority: 'critical', resolutionTimeMin: 60, escalateAfterMin: 45 },
  { priority: 'high', resolutionTimeMin: 240, escalateAfterMin: 180 },
  { priority: 'medium', resolutionTimeMin: 1440, escalateAfterMin: 1200 },
  { priority: 'low', resolutionTimeMin: 4320, escalateAfterMin: 3600 },
];

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
    { keyword: 'urgent, critical, broken, system down', priority: 'critical' },
  ],
  healthcare: [
    { keyword: 'system down, portal not loading, cannot access, server error', priority: 'critical' },
    { keyword: 'patient data missing, records not found, data lost', priority: 'critical' },
    { keyword: 'appointment not confirmed, booking failed', priority: 'high' },
    { keyword: 'prescription not available, medicine not found', priority: 'high' },
    { keyword: 'billing error, invoice wrong, charge incorrect', priority: 'medium' },
    { keyword: 'report not available, test result missing', priority: 'medium' },
    { keyword: 'update profile, change doctor', priority: 'low' },
    { keyword: 'urgent, critical, broken', priority: 'critical' },
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
    { keyword: 'urgent, critical, broken', priority: 'critical' },
  ],
};

const fixTenants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to DB...');

    // Get all unique (tenantId, domain) combos
    const users = await User.find({}).lean();
    const tenantMap = {};
    for (const u of users) {
      if (!u.tenantId || !u.domain) continue;
      const key = `${u.tenantId}_${u.domain}`;
      if (!tenantMap[key]) {
        tenantMap[key] = { tenantId: u.tenantId, domain: u.domain };
      }
    }

    for (const { tenantId, domain } of Object.values(tenantMap)) {
      // Ensure domain doc exists and has rules
      let domainDoc = await Domain.findOne({ tenantId, name: domain });
      if (!domainDoc) {
        domainDoc = await Domain.create({
          tenantId,
          name: domain,
          rules: DEFAULT_RULES[domain] || [],
        });
        console.log(`✅  Created domain config: ${domain} / tenantId: ${tenantId}`);
      } else if (!domainDoc.rules || domainDoc.rules.length === 0) {
        domainDoc.rules = DEFAULT_RULES[domain] || [];
        await domainDoc.save();
        console.log(`✅  Patched rules for domain: ${domain} / tenantId: ${tenantId}`);
      } else {
        console.log(`⏭️   Domain config already OK: ${domain}`);
      }

      // Ensure all 4 SLA policies exist
      for (const p of DEFAULT_SLA_POLICIES) {
        const exists = await SLAPolicy.findOne({ tenantId, priority: p.priority });
        if (!exists) {
          await SLAPolicy.create({ tenantId, domain, ...p });
          console.log(`✅  Created SLA [${p.priority}] for tenantId: ${tenantId}`);
        }
      }
    }

    console.log('\n🎉  All tenants fully patched!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌  Error:', err);
    process.exit(1);
  }
};

fixTenants();
