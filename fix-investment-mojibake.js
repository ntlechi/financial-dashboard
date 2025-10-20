const fs = require('fs');
const path = require('path');

// Read the App.js file
const filePath = path.join(__dirname, 'src', 'App.js');
let content = fs.readFileSync(filePath, 'utf8');

const originalLength = content.length;

// Investment page specific sequences
const replacements = {
  '1ï¸❌ƒ£': '1️⃣',
  '2ï¸❌ƒ£': '2️⃣',
  '3ï¸❌ƒ£': '3️⃣',
  '❌€¢': '✓',
  'ðŸ"ï¸': '🏔️',
  'ðŸ›¡ï¸': '🛡️',
  'ðŸ'¼': '💼',
  'ðŸŒ': '🌍',
  'ðŸ"…': '📅',
};

let totalReplacements = 0;
for (const [corrupted, fixed] of Object.entries(replacements)) {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, fixed);
    console.log(`✅ Replaced "${corrupted}" with "${fixed}" (${matches.length} times)`);
    totalReplacements += matches.length;
  }
}

if (totalReplacements > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n🎉 Total replacements: ${totalReplacements}`);
  console.log(`📝 File size: ${originalLength} → ${content.length} bytes`);
} else {
  console.log('ℹ️  No mojibake sequences found (already clean or different encoding)');
}

