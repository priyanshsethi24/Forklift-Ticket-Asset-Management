import React from "react";
import styles from "./herosection.module.css";

const HeroSection = (props) => {
  const {t, handleSearch, setSearchQuery, searchQuery, isUsersView} = props;
  return (
    <div className="fixed top-[.9rem]  right-[4rem] sm:right-[13rem] z-50  px-1 sm:px-2 md:px-4">
    <div className="max-w-[200px]   sm:max-w-[40rem] md:max-w-[40rem] lg:max-w-lg  ">
      <form className="flex w-full " onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}>
        <input
          type="text"
          className="w-[100%]  px-1 sm:px-3 md:px-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300  focus:outline-none focus:ring-2  focus:border-transparent px-2"
          placeholder={isUsersView ? t("Search users...") : t("dashboard.tickets.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#007bff] hover:bg-blue-700 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-sm sm:text-base -r-md transition duration-200"
        >
          <span className="hidden sm:inline">{t("dashboard.buttons.Search")}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  </div>
  );
};

export default HeroSection;
