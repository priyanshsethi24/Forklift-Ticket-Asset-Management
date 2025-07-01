import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaTicketAlt,
  FaUser,
} from "react-icons/fa";
import { BiSolidOffer } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import { useDispatch, useSelector } from 'react-redux';


const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [userRole, setUserRole] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const menuItems = (() => {
    switch (userRole) {
      case "asset_manager":
        return [
          {
            path: "/dashboard/",
            label: t("sidebar.dashboard"),
            icon: <FaClipboardList />,
          },
        ];
      case "customer_manager":
        return [
          {
            path: "/dashboard",
            label: t("sidebar.dashboard"),
            icon: <FaClipboardList />,
          },
          {
            path: "/dashboard/offers",
            label: t("sidebar.offers"),
            icon: <BiSolidOffer />,
          },
        ];
      case "finance_manager":
        return [
          {
            path: "/dashboard",
            label: t("sidebar.dashboard"),
            icon: <FaClipboardList />,
          },
        ];
      case "warehouse_manager":
        return [
          {
            path: "/dashboard",
            label: t("sidebar.dashboard"),
            icon: <FaClipboardList />,
          },
        ];
      case "user":
        return [
          {
            path: "/dashboard/user",
            label: t("sidebar.user.dashboard"),
            icon: <FaClipboardList />,
          },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-wrapper">
          <FaTicketAlt className="sidebar-logo-icon" />
          <div className="logo-text-container">
            <span className="logo-text-main">{t("sidebar.logo.mainText")}</span>
            <span className="logo-text-sub">{t("sidebar.logo.subText")}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
            style={{ marginLeft: location.pathname === item.path ? "" : "5px" }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
