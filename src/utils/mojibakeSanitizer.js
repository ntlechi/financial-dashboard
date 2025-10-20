// Comprehensive mojibake cleanup - replace with clean text labels
const replacements = [
  // Replace corrupted sequences with clean text equivalents
  // Most visible sequences from screenshots
  [/ðŸ"ï¸\s*/g, ''],  // Mountain/compass icon - remove, keep just "Freedom Ratio"
  [/ðŸ›¡ï¸\s*/g, '🛡️ '],  // Shield
  [/✕/g, '✓'],  // X mark -> checkmark
  [/✗/g, '✓'],  // Another X variant
  
  // Investment page sequences - exact patterns from screenshot
  [/1ðŸ"¥\s*f£/g, '1️⃣ '],
  [/2ðŸ"ˆ\s*f£/g, '2️⃣ '],
  [/3ðŸ'°\s*f£/g, '3️⃣ '],
  [/1ðŸ"¥/g, '1️⃣ '],
  [/2ðŸ"ˆ/g, '2️⃣ '],
  [/3ðŸ'°/g, '3️⃣ '],
  [/ðŸ"¥/g, ''],
  [/ðŸ"ˆ/g, ''],
  [/ðŸ'°/g, ''],
  [/f£/g, ''],  // Fragment cleanup
  
  // Bullet point corruption
  [/✕\s*€\s*¢/g, '✓ '],
  [/€\s*¢/g, '✓ '],
  
  // Other common emoji corruption - replace with text or simple icons
  [/ðŸŽ¯\s*/g, '🎯 '],
  [/ðŸ"Š\s*/g, '📊 '],
  [/ðŸ"®\s*/g, ''],
  [/ðŸ'¡\s*/g, '💡 '],
  [/ðŸ•Šï¸\s*/g, '⏰ '],
  [/ðŸ"…\s*/g, '📅 '],
  [/ðŸ—"ï¸\s*/g, '📓 '],
  [/ðŸ"†\s*/g, '📆 '],
  [/ðŸ"‹\s*/g, '📋 '],
  [/ðŸ›¡\s*/g, '🛡️ '],
  [/ðŸ›ï¸\s*/g, '🛍️ '],
  [/ðŸ½ï¸\s*/g, '🍽️ '],
  [/ðŸšŒ\s*/g, '🚌 '],
  [/ðŸ¨\s*/g, '🏨 '],
  [/ðŸ'«\s*/g, '✨ '],
  [/ðŸ•ï¸\s*/g, '⛺ '],
  [/❌š¡\s*/g, '⚡ '],
  [/❌„¹ï¸\s*/g, 'ℹ️ '],
  [/❌œï¸\s*/g, '✏️ '],
  
  // Catch-all for remaining mojibake - just remove it
  [/ðŸ[^\s]{0,10}/g, ''],
  [/ï¸\s*/g, ''],
  [/â€[^\s]{0,3}/g, ''],
  [/¢\s*€\s*/g, '✓ '],  // Check mark corruption
];

function fixText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  // Clean up multiple spaces
  result = result.replace(/\s{2,}/g, ' ').trim();
  return result;
}

function sanitizeAllText() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  
  let changesCount = 0;
  textNodes.forEach((node) => {
    const original = node.nodeValue;
    const fixed = fixText(original);
    if (fixed !== original) {
      node.nodeValue = fixed;
      changesCount++;
    }
  });
  
  if (changesCount > 0) {
    console.log(`🧹 Sanitizer cleaned ${changesCount} text nodes`);
  }
}

export function startMojibakeSanitizer() {
  console.log('🧹 Mojibake Sanitizer starting...');
  
  // Initial cleanup
  if (document.body) {
    sanitizeAllText();
  }
  
  // Wait for React render and clean again
  setTimeout(() => {
    sanitizeAllText();
  }, 100);
  
  setTimeout(() => {
    sanitizeAllText();
  }, 500);
  
  setTimeout(() => {
    sanitizeAllText();
  }, 1500);

  // Observe future DOM changes
  const observer = new MutationObserver((mutations) => {
    let needsCleanup = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        needsCleanup = true;
        break;
      }
      if (m.type === 'characterData') {
        const fixed = fixText(m.target.nodeValue);
        if (fixed !== m.target.nodeValue) {
          m.target.nodeValue = fixed;
        }
      }
    }
    
    if (needsCleanup) {
      // Debounce multiple mutations
      clearTimeout(window.mojibakeCleanupTimer);
      window.mojibakeCleanupTimer = setTimeout(() => {
        sanitizeAllText();
      }, 50);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log('✅ Mojibake Sanitizer active');
}

export default startMojibakeSanitizer;
