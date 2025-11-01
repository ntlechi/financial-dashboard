import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const toggleLanguage = () => {
    // Cycle through EN → FR → ES → EN
    let newLang;
    if (i18n.language === 'en') {
      newLang = 'fr';
    } else if (i18n.language === 'fr') {
      newLang = 'es';
    } else {
      newLang = 'en';
    }
    i18n.changeLanguage(newLang);
    // Save preference to localStorage
    localStorage.setItem('preferredLanguage', newLang);
  };

  const getLanguageLabel = () => {
    switch (i18n.language) {
      case 'fr': return 'FR';
      case 'es': return 'ES';
      default: return 'EN';
    }
  };

  const getNextLanguage = () => {
    switch (i18n.language) {
      case 'en': return t('languageSwitcher.french');
      case 'fr': return t('languageSwitcher.spanish');
      default: return t('languageSwitcher.english');
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      title={t('languageSwitcher.switchTo', { language: getNextLanguage() })}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {getLanguageLabel()}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
