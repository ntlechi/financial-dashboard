const fs = require('fs');
const path = require('path');

// Read file
const filePath = path.join(__dirname, 'src', 'App.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace step numbers - use regex to find the line number pattern
content = content.replace(
  /<div className="text-3xl mb-3">1[^<]+<\/div>/g,
  '<div className="text-3xl mb-3 font-bold text-violet-300">1</div>'
);

content = content.replace(
  /<div className="text-3xl mb-3">2[^<]+<\/div>/g,
  '<div className="text-3xl mb-3 font-bold text-blue-300">2</div>'
);

content = content.replace(
  /<div className="text-3xl mb-3">3[^<]+<\/div>/g,
  '<div className="text-3xl mb-3 font-bold text-green-300">3</div>'
);

// Replace bullet points in Investment section only
// Find the Investment Getting Started section and fix bullets there
const investmentSectionStart = content.indexOf('Getting Started with Investing');
const investmentSectionEnd = content.indexOf('Beginner Tips', investmentSectionStart);

if (investmentSectionStart > -1 && investmentSectionEnd > -1) {
  const before = content.substring(0, investmentSectionStart);
  const section = content.substring(investmentSectionStart, investmentSectionEnd);
  const after = content.substring(investmentSectionEnd);
  
  // In this section only, replace corrupted bullets with simple bullets
  const cleanedSection = section.replace(/<li>[^•]*(<strong>|See |Track |View |Monitor |Auto-|Compound |Build |Track )/g, '<li>• $1');
  
  content = before + cleanedSection + after;
  console.log('✅ Cleaned Investment section bullets');
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed Investment page step numbers');
console.log('✅ App.js updated successfully!');

