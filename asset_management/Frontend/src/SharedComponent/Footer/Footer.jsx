import React from 'react';
import { FaRegCopyright } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation(); // To handle translations
  
  return (
    <footer className="w-full bg-[#1b1b1b] text-gray-400 py-6 px-4 sm:px-6 mt-auto">
    <div className="flex flex-col items-center justify-center text-sm space-y-4">
      {/* Copyright Section */}
      <div className="flex items-center text-gray-400">
        <FaRegCopyright className="mr-1" />
        <span>2025 {t("createAsset.buttons.Allrightsreserved")}</span>
      </div>
      
      {/* Links Section */}
      <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-4 text-gray-200">
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
          {t("createAsset.buttons.Quantial")}
        </a>
        <span className="hidden xs:inline">•</span>
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
          {t("createAsset.buttons.DataProtection")}
        </a>
        <span className="hidden xs:inline">•</span>
        <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
          {t("createAsset.buttons.TermsAndCondition")}
        </a>
      </div>
    </div>
  </footer>
  );
};

export default Footer;