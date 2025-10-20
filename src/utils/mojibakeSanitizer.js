// Mapping of common mojibake sequences -> intended characters/text
const replacements = [
  // Emoji corruption (UTF-8 seen as Windows-1252)
  [/ðŸ›¡ï¸/g, '🛠️'],
  [/ðŸ”ï¸/g, '🏔️'],
  [/ðŸŽ¯/g, '🎯'],
  [/ðŸ“Š/g, '📊'],
  [/ðŸ“ˆ/g, '📈'],
  [/ðŸ”®/g, '🔮'],
  [/ðŸ’¡/g, '💡'],
  [/ðŸ•Šï¸/g, '🕒'],
  [/ðŸ“…/g, '🗓️'],
  [/ðŸ—“ï¸/g, '📓'],
  [/ðŸ“†/g, '📆'],
  [/ðŸ“‹/g, '📋'],
  [/ðŸ›¡/g, '🛠'],
  [/ðŸ›ï¸/g, '🛍️'],
  [/ðŸ½ï¸/g, '🍽️'],
  [/ðŸšŒ/g, '🚄'],
  [/ðŸ¨/g, '🏨'],
  [/ðŸ’«/g, '💫'],
  [/❌š¡/g, '⚠️'],
  [/❌„¹ï¸/g, 'ℹ️'],
  [/❌œï¸/g, '✏️'],

  // Generic fragments sometimes left over
  [/ï¸/g, ''],
  [/ðŸ/g, ''], // fallback cleanup; keep last to avoid over-removal earlier
];

function fixText(text) {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function startMojibakeSanitizer() {
  // Initial pass over existing DOM text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    const fixed = fixText(node.nodeValue);
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
  }

  // Observe future mutations (tooltips, dynamic banners, tabs)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        m.addedNodes.forEach((n) => sanitizeNode(n));
      } else if (m.type === 'characterData' && m.target?.nodeType === Node.TEXT_NODE) {
        const fixed = fixText(m.target.nodeValue);
        if (fixed !== m.target.nodeValue) m.target.nodeValue = fixed;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const fixed = fixText(node.nodeValue);
    if (fixed !== node.nodeValue) node.nodeValue = fixed;
    return;
  }
  if (!(node instanceof Element)) return;
  // Prioritize visible UI: navs, headers, banners, tabs
  const prioritySelectors = ['nav', '[role="tablist"]', '.banner', '[data-banner]', 'header'];
  if (prioritySelectors.some((sel) => node.matches?.(sel))) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((t) => {
      const fixed = fixText(t.nodeValue);
      if (fixed !== t.nodeValue) t.nodeValue = fixed;
    });
  } else {
    // Light-touch for other nodes: only fix direct text children
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fixed = fixText(child.nodeValue);
        if (fixed !== child.nodeValue) child.nodeValue = fixed;
      }
    });
  }
}

export default startMojibakeSanitizer;


