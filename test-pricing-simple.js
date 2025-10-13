// Simple test for 3-Phase Pricing System
console.log('🎯 TESTING 3-PHASE PRICING SYSTEM\n');

// Test date logic
const now = new Date();
const foundersStart = new Date('2025-10-19T13:00:00.000Z');
const foundersEnd = new Date('2025-10-26T23:59:59.999Z');
const earlyAdopterStart = new Date('2025-10-27T00:00:00.000Z');
const earlyAdopterEnd = new Date('2026-01-01T23:59:59.999Z');

console.log('📅 Current Date:', now.toISOString());
console.log('📅 Founder\'s Circle Period:', foundersStart.toISOString(), 'to', foundersEnd.toISOString());
console.log('📅 Early Adopter Period:', earlyAdopterStart.toISOString(), 'to', earlyAdopterEnd.toISOString());

// Test phase detection logic
function getCurrentPricingPhase(foundersCount = 0, earlyAdopterCount = 0) {
  const now = new Date();
  
  // Check Founder's Circle phase
  if (now >= foundersStart && now <= foundersEnd && foundersCount < 100) {
    return 'founders';
  }
  
  // Check Early Adopter phase
  if (now >= earlyAdopterStart && now <= earlyAdopterEnd && earlyAdopterCount < 500) {
    return 'early-adopter';
  }
  
  // Default to regular pricing
  return 'regular';
}

// Test scenarios
const testScenarios = [
  {
    name: 'Current Time - Founder\'s Circle Available',
    foundersCount: 50,
    earlyAdopterCount: 0,
    expectedPhase: 'founders'
  },
  {
    name: 'Founder\'s Circle Full (100/100)',
    foundersCount: 100,
    earlyAdopterCount: 0,
    expectedPhase: 'early-adopter'
  },
  {
    name: 'Early Adopter Phase',
    foundersCount: 100,
    earlyAdopterCount: 200,
    expectedPhase: 'early-adopter'
  },
  {
    name: 'Early Adopter Full (500/500)',
    foundersCount: 100,
    earlyAdopterCount: 500,
    expectedPhase: 'regular'
  }
];

console.log('\n🧪 TESTING SCENARIOS:\n');

testScenarios.forEach((scenario, index) => {
  console.log(`📋 Test ${index + 1}: ${scenario.name}`);
  console.log(`   Founders: ${scenario.foundersCount}/100`);
  console.log(`   Early Adopters: ${scenario.earlyAdopterCount}/500`);
  
  const phase = getCurrentPricingPhase(scenario.foundersCount, scenario.earlyAdopterCount);
  console.log(`   ✅ Detected Phase: ${phase}`);
  console.log(`   ✅ Expected Phase: ${scenario.expectedPhase}`);
  
  if (phase === scenario.expectedPhase) {
    console.log(`   🎉 PASS\n`);
  } else {
    console.log(`   ❌ FAIL\n`);
  }
});

console.log('🎯 PRICING PHASE SUMMARY:');
console.log('Phase 1: Founder\'s Circle (Oct 19-26, 2025) - $7.49/month - 100 spots');
console.log('Phase 2: Early Adopter (Oct 27, 2025 - Jan 1, 2026) - $8.49/month - 500 spots');
console.log('Phase 3: Regular Pricing (Jan 2, 2026+) - $14.99/month - No limit');

console.log('\n✅ Pricing system logic test complete!');


