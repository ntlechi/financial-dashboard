const fs = require('fs');
const path = require('path');

// Read the App.js file
const filePath = path.join(__dirname, 'src', 'App.js');
let content = fs.readFileSync(filePath, 'utf8');

// Define corrupted character mappings based on what we've seen
const corruptedMappings = {
  // Common corrupted patterns we've seen
  'ðŸ"Š': '📊', // bar chart
  'ðŸ"ï,': '🎯', // target
  'ÕŸCEO': '🧳', // luggage
  'δΫ\'<<': '📸', // camera
  'ðŸš€': '🚀', // rocket
  '🛡️': '🛡️', // shield (if corrupted)
  '✅': '✅', // checkmark (if corrupted)
  '❌': '❌', // X mark (if corrupted)
  'X†\'': '❌', // corrupted X
  'ÕΫ\'34': '📊', // corrupted chart
  'œï¸': '', // remove these fragments
  'âœ…': '✅', // corrupted checkmark
  'â': '❌', // corrupted X
  
  // Additional patterns from your screenshots
  'ðΫ"...': '📊', // corrupted chart
  'ðΫ",': '📊', // corrupted chart
  'ÖY\'¡': '📊', // corrupted chart
  'ŌYCEO': '🧳', // corrupted luggage
  'Ϋ"...': '📊', // corrupted chart
  '1i,0X f£': '1️⃣ Add', // corrupted step 1
  '2i,0X f£': '2️⃣ Track', // corrupted step 2
  '3i,0X f£': '3️⃣ Build', // corrupted step 3
  'X €': '✅', // corrupted checkmark
  'ðŸ\'14': '📚', // corrupted book
};

// Replace all corrupted characters
let totalReplacements = 0;
Object.entries(corruptedMappings).forEach(([corrupted, fixed]) => {
  const regex = new RegExp(corrupted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    content = content.replace(regex, fixed);
    console.log(`Replaced "${corrupted}" with "${fixed}" (${matches.length} times)`);
    totalReplacements += matches.length;
  }
});

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Total replacements made: ${totalReplacements}`);
console.log('✅ All corrupted characters fixed!');
