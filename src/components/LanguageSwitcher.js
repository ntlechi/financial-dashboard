import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      title={`Switch to ${i18n.language === 'en' ? 'Français' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {i18n.language === 'en' ? 'EN' : 'FR'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
