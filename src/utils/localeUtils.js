// Locale utilities for date/number formatting and language detection

export function getAppLanguage() {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('appLanguage') : null;
    if (stored) return stored;
    const nav = typeof navigator !== 'undefined' ? (navigator.language || (navigator.languages && navigator.languages[0])) : 'en';
    const lc = (nav || 'en').toLowerCase();
    if (lc.startsWith('fr')) return 'fr';
    if (lc.startsWith('es')) return 'es';
    return 'en';
  } catch (_) {
    return 'en';
  }
}

export function getUserLocale() {
  const lang = getAppLanguage();
  switch (lang) {
    case 'fr':
      return 'fr-CA';
    case 'es':
      return 'es-ES';
    default:
      return 'en-US';
  }
}

export function formatDate(date, options) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(getUserLocale(), options);
  } catch (e) {
    return String(date);
  }
}

export function formatNumber(value, options) {
  try {
    return Number(value).toLocaleString(getUserLocale(), options);
  } catch (e) {
    return String(value);
  }
}


