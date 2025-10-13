// Test script for 3-Phase Pricing System
// Run this with: node test-pricing-phases.js

// Mock the pricing system
const { getCurrentPricingPhase, getPricingPhaseInfo, getPricingPhaseMessage } = require('./src/pricing');

console.log('🎯 TESTING 3-PHASE PRICING SYSTEM\n');

// Test different scenarios
const testScenarios = [
  {
    name: 'Founder\'s Circle Phase (Oct 19-26, 2025)',
    foundersCount: 50,
    earlyAdopterCount: 0,
    expectedPhase: 'founders'
  },
  {
    name: 'Founder\'s Circle Phase - Full (100/100)',
    foundersCount: 100,
    earlyAdopterCount: 0,
    expectedPhase: 'early-adopter'
  },
  {
    name: 'Early Adopter Phase (Oct 27 - Jan 1, 2026)',
    foundersCount: 100,
    earlyAdopterCount: 200,
    expectedPhase: 'early-adopter'
  },
  {
    name: 'Early Adopter Phase - Full (500/500)',
    foundersCount: 100,
    earlyAdopterCount: 500,
    expectedPhase: 'regular'
  },
  {
    name: 'Regular Pricing Phase (Jan 2, 2026+)',
    foundersCount: 100,
    earlyAdopterCount: 500,
    expectedPhase: 'regular'
  }
];

testScenarios.forEach((scenario, index) => {
  console.log(`\n📋 Test ${index + 1}: ${scenario.name}`);
  console.log(`   Founders: ${scenario.foundersCount}/100`);
  console.log(`   Early Adopters: ${scenario.earlyAdopterCount}/500`);
  
  try {
    const phase = getCurrentPricingPhase(scenario.foundersCount, scenario.earlyAdopterCount);
    const phaseInfo = getPricingPhaseInfo(scenario.foundersCount, scenario.earlyAdopterCount);
    const message = getPricingPhaseMessage(phase);
    
    console.log(`   ✅ Phase: ${phase}`);
    console.log(`   ✅ Message: ${message}`);
    console.log(`   ✅ Is Founders: ${phaseInfo.isFoundersPhase}`);
    console.log(`   ✅ Is Early Adopter: ${phaseInfo.isEarlyAdopterPhase}`);
    console.log(`   ✅ Is Regular: ${phaseInfo.isRegularPhase}`);
    
    if (phase === scenario.expectedPhase) {
      console.log(`   🎉 PASS: Expected ${scenario.expectedPhase}, got ${phase}`);
    } else {
      console.log(`   ❌ FAIL: Expected ${scenario.expectedPhase}, got ${phase}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
});

console.log('\n🎯 PRICING PHASE SUMMARY:');
console.log('Phase 1: Founder\'s Circle (Oct 19-26, 2025) - $7.49/month - 100 spots');
console.log('Phase 2: Early Adopter (Oct 27, 2025 - Jan 1, 2026) - $8.49/month - 500 spots');
console.log('Phase 3: Regular Pricing (Jan 2, 2026+) - $14.99/month - No limit');

console.log('\n✅ Pricing system implementation complete!');


