const fs = require('fs');
const path = require('path');

// Read file
const filePath = path.join(__dirname, 'src', 'App.js');
let content = fs.readFileSync(filePath, 'utf8');

// Simple replacements that work byte-by-byte
const replacements = [
  // Step numbers
  ['<div className="text-3xl mb-3">1', '<div className="text-3xl mb-3 font-bold text-violet-300">1'],
  ['<div className="text-3xl mb-3">2', '<div className="text-3xl mb-3 font-bold text-blue-300">2'],
  ['<div className="text-3xl mb-3">3', '<div className="text-3xl mb-3 font-bold text-green-300">3'],
];

// Apply each replacement
for (const [search, replace] of replacements) {
  if (content.includes(search)) {
    content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    console.log(`✅ Replaced: ${search.substring(0, 40)}...`);
  }
}

// Now fix the bullets - find each <li> in Investment section and clean the start
const lines = content.split('\n');
let inInvestmentSection = false;
let investmentEndFound = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('Getting Started with Investing')) {
    inInvestmentSection = true;
  }
  
  if (inInvestmentSection && line.includes('Beginner Tips')) {
    investmentEndFound = true;
    inInvestmentSection = false;
  }
  
  if (inInvestmentSection && line.trim().startsWith('<li>')) {
    // Replace everything between <li> and first word/tag with <li>•
    lines[i] = line.replace(/<li>[^<a-zA-Z]*/, '<li>• ');
  }
}

content = lines.join('\n');

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed Investment page completely!');
console.log('✅ Step numbers: 1, 2, 3 (clean)');
console.log('✅ Bullets: • (simple dots)');

