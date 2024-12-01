'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaLanguage } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'cs' ? 'en' : 'cs';
    await i18n.changeLanguage(newLang);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="language-switcher"
      title="Change Language"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        marginRight: '10px',
      }}
    >
      <FaLanguage size={24} color="var(--icon-color)" />
      <motion.div
        className="language-tooltip"
        initial={{ opacity: 0, y: -10 }}
        whileHover={{ opacity: 1, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--background-color)',
          color: 'var(--text-color)',
          padding: '5px 10px',
          borderRadius: '5px',
          boxShadow: 'var(--box-shadow)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {i18n.language === 'cs' ? 'English' : 'Čeština'}
      </motion.div>
    </motion.button>
  );
};

export default LanguageSwitcher;