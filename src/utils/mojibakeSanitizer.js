// Comprehensive mojibake cleanup for UTF-8 corruption
const replacements = [
  // Most visible sequences from screenshot
  [/ðŸ"ï¸/g, '🏔️'],
  [/ðŸ›¡ï¸/g, '🛡️'],
  [/✕/g, '✗'],
  
  // Other emoji corruption
  [/ðŸŽ¯/g, '🎯'],
  [/ðŸ"Š/g, '📊'],
  [/ðŸ"ˆ/g, '📈'],
  [/ðŸ"®/g, '🔮'],
  [/ðŸ'¡/g, '💡'],
  [/ðŸ•Šï¸/g, '🕒'],
  [/ðŸ"…/g, '🗓️'],
  [/ðŸ—"ï¸/g, '📓'],
  [/ðŸ"†/g, '📆'],
  [/ðŸ"‹/g, '📋'],
  [/ðŸ›¡/g, '🛠'],
  [/ðŸ›ï¸/g, '🛍️'],
  [/ðŸ½ï¸/g, '🍽️'],
  [/ðŸšŒ/g, '🚄'],
  [/ðŸ¨/g, '🏨'],
  [/ðŸ'«/g, '💫'],
  [/ðŸ•ï¸/g, '🏕️'],
  [/ðŸ'°/g, '💰'],
  [/❌š¡/g, '⚡'],
  [/❌„¹ï¸/g, 'ℹ️'],
  [/❌œï¸/g, '✏️'],
  
  // Aggressive cleanup: any remaining mojibake
  [/ðŸ[^\s]{0,10}/g, ''],
  [/ï¸/g, ''],
  [/â€[^\s]{0,3}/g, ''],
];

function fixText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
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
  
  textNodes.forEach((node) => {
    const fixed = fixText(node.nodeValue);
    if (fixed !== node.nodeValue) {
      node.nodeValue = fixed;
    }
  });
}

export function startMojibakeSanitizer() {
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
  }, 1000);

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
      sanitizeAllText();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

export default startMojibakeSanitizer;
