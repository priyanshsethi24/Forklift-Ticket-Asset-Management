import React from 'react';
import { useTranslation } from 'react-i18next';
import { storeLanguage } from '../../utils/languageUtils';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    storeLanguage(language);
  };

  return (
    <div className="language-switcher">
      <button
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={i18n.language === 'de' ? 'active' : ''}
        onClick={() => changeLanguage('de')}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher; 