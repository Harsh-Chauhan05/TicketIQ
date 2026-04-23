const Domain = require('../models/Domain');

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const BASE_SCORES = { critical: 90, high: 65, medium: 40, low: 15 };

/**
 * Assign priority to a ticket by scanning its text against domain keyword rules.
 * Returns { systemPriority, finalPriority, priorityScore }
 */
const assignPriority = async (ticketData, tenantId) => {
  try {
    // Load domain rules from DB
    const domain = await Domain.findOne({ tenantId, name: ticketData.domain });
    console.log(`🤖 [PriorityEngine] Scanning domain: ${ticketData.domain}, tenant: ${tenantId}`);

    let systemPriority = null; // Start with null to detect if any match was found

    // Normalize ticket text (case-insensitive substring matching)
    const text = `${ticketData.title} ${ticketData.description}`.toLowerCase();

    // Scan each rule
    if (domain && domain.rules && domain.rules.length > 0) {
      console.log(`🤖 [PriorityEngine] Found ${domain.rules.length} rules to check`);
      for (const rule of domain.rules) {
        const keywords = rule.keyword
          .split(',')
          .map((k) => k.trim().toLowerCase())
          .filter((k) => k.length > 0);

        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            console.log(`✨ [PriorityEngine] Match found! Keyword: "${keyword}" -> Priority: ${rule.priority}`);
            
            // If we already have a systemPriority, only upgrade if this rule is higher
            if (!systemPriority || PRIORITY_RANK[rule.priority] > PRIORITY_RANK[systemPriority]) {
              systemPriority = rule.priority;
            }
            break; // matched this rule — move to next rule
          }
        }
        if (systemPriority === 'critical') break;
      }
    } else {
      console.warn('⚠ [PriorityEngine] No rules found for this domain/tenant');
    }

    // Final Priority Strategy:
    // If AI found a match (systemPriority is set), it ALWAYS overrides the user.
    // If AI found nothing, we trust the user's selection.
    const finalPriority = systemPriority || ticketData.userPriority;

    console.log(`🤖 [PriorityEngine] Decision: AI Result: ${systemPriority || 'None'}, User Input: ${ticketData.userPriority} => Final: ${finalPriority}`);

    // Calculate priorityScore (0-100)
    let priorityScore = BASE_SCORES[finalPriority] || 15;
    
    // Add small detail-based boost
    const textLengthBoost = Math.min(Math.floor(text.length / 100), 5);
    priorityScore += textLengthBoost;
    
    priorityScore = Math.min(priorityScore, 99);

    return { 
      systemPriority: systemPriority || 'low', 
      finalPriority, 
      priorityScore 
    };
  } catch (err) {
    console.error('Priority engine error:', err.message);
    return {
      systemPriority: ticketData.userPriority,
      finalPriority: ticketData.userPriority,
      priorityScore: BASE_SCORES[ticketData.userPriority] || 15,
    };
  }
};

module.exports = { assignPriority };
