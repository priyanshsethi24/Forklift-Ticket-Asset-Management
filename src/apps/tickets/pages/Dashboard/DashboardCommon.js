import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AssetManagerDashboard from "./AssetManagerDashboard";
import Customers from "./Customer_Manager/Customers";
import WarehouseTableData from "./WarehouseManager/WarehouseTableData";
import FinanceTableData from "./Finance_Manager/FinanceTableData";

// import { useLocation } from "react-router-dom";

export const DashboardCommon = () => {
  // const location = useLocation()
  // const role = location.state.role;
  const role = localStorage.getItem("userRole");

  return (
    <div id="dashboard">
      {role === "customer_manager" ? (
        <Customers />
      ) : (
        role === "warehouse_manager" ?  <WarehouseTableData/>  :
       
        <AssetManagerDashboard />
      )}

     
    </div>
  );
};

export default DashboardCommon;
