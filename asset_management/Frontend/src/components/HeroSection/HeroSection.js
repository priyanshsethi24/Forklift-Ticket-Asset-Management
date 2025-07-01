import React from "react";
import styles from "./herosection.module.css";

const HeroSection = (props) => {
  const {t, handleSearch, setSearchQuery, searchQuery, isUsersView} = props;
  return (
    <div className={styles["search-hero"]} >
      <div className={styles["search-container"]}>
        <h1 className={styles["search-title"]}>{t("createAsset.buttons.How")}</h1>
        <form className={styles["search-form"]} onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}>
          <input
            type="text"
            className={styles["search-input"]}
            placeholder={isUsersView ? t("Search users...") : t("createAsset.buttons.Search By Id")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles["search-button"]}>
          {t("createAsset.buttons.Search")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;
