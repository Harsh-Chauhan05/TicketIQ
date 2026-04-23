const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Domain = require('../models/Domain');
const SLAPolicy = require('../models/SLAPolicy');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // For MVP, we'll create a default domain config for a dummy tenantId
    // In a real app, this happens during tenant registration.
    const dummyTenantId = new mongoose.Types.ObjectId();

    let domain = await Domain.findOne({ name: 'ecommerce' });
    if (!domain) {
      domain = await Domain.create({
        tenantId: dummyTenantId,
        name: 'ecommerce',
        rules: [
          { keyword: 'urgent', priority: 'critical' },
          { keyword: 'broken', priority: 'high' },
          { keyword: 'login', priority: 'high' },
          { keyword: 'billing', priority: 'medium' },
          { keyword: 'feedback', priority: 'low' },
        ]
      });
      console.log('Created default ecommerce domain');
    }

    // Create SLA Policies
    const policies = [
      { priority: 'critical', resolveWithinMinutes: 60, escalateAfterMinutes: 45 },
      { priority: 'high', resolveWithinMinutes: 240, escalateAfterMinutes: 180 },
      { priority: 'medium', resolveWithinMinutes: 1440, escalateAfterMinutes: 1000 },
      { priority: 'low', resolveWithinMinutes: 2880, escalateAfterMinutes: 2000 },
    ];

    for (const p of policies) {
      const exists = await SLAPolicy.findOne({ tenantId: domain.tenantId, priority: p.priority });
      if (!exists) {
        await SLAPolicy.create({ 
          ...p, 
          tenantId: domain.tenantId, 
          domainId: domain._id 
        });
        console.log(`Created SLA policy for ${p.priority}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
