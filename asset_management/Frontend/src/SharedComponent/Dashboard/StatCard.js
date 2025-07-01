import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCubes,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMoneyBill,
  FaChartLine,
  FaTools,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { getProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAssetData,
  setAssetsDashboard,
} from "../../redux/slices/assetsSlice";
import {
  selectCustomerData,
  setCustomerDashboard,
} from "../../redux/slices/customerSlice";
import { store } from "../../redux/store";

const StatCard = ({ onRefreshDashboard }) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({});
  const [updateKey, setUpdateKey] = useState(0);
  const dispatch = useDispatch();
  const { assetDashboard } = useSelector(selectAssetData);
  const { customerDashboard } = useSelector(selectCustomerData);
  const role = localStorage.getItem("userRole");

  const getDashboard = async () => {
    try {
      const url = API_END_POINTS.dashboard;
      const response = await getProtected(url);
      if (response) {
        if (role === "asset_manager") {
          dispatch(setAssetsDashboard(response));
        } else if (role === "customer_manager") {
          dispatch(setCustomerDashboard(response));
        }
        setDashboardData(response);
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t("dashboard.errors.fetchFailed"));
      }
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  const refreshDashboardData = () => {
    getDashboard();
    setUpdateKey(prev => prev + 1);
  };

  const assetsItems = useMemo(() => {
    if (role !== "asset_manager") return [];
    if (!assetDashboard) return [];
    
    // Commented out the original items array
    return [];
  }, [role, t, assetDashboard]);

  const customer_ManagerItem = useMemo(() => {
    if (role !== "customer_manager") return [];
    if (!customerDashboard?.customer_overview) return [];
    return [
      {
        icon: FaCubes,
        value:
          customerDashboard?.customer_overview?.total_customers_managed || 0,
        label: t("dashboard.customerManager.totalCustomers"),
        colorClass: "bg-blue-500",
      },
      {
        icon: FaCalendarAlt,
        value:
          customerDashboard?.customer_overview?.total_accepted_revenue || 0,
        label: t("dashboard.customerManager.totalRevenue"),
        colorClass: "bg-blue-500",
      },
      {
        icon: FaExclamationTriangle,
        value: customerDashboard?.customer_overview?.accepted_offers || 0,
        label: t("dashboard.customerManager.acceptedOffers"),
        colorClass: "bg-green-500",
      },
      {
        icon: FaShieldAlt,
        value: customerDashboard?.customer_overview?.pending_offers || 0,
        label: t("dashboard.customerManager.pendingOffers"),
        colorClass: "bg-yellow-500",
      },
    ];
  }, [customerDashboard, role, t]);

  const warehouse_ManagerItem = useMemo(() => {
    if (role !== "warehouse_manager") return [];
    if (!dashboardData) return [];

    const warehouseData = dashboardData?.warehouse_overview?.[0];

    return [
      {
        icon: FaCubes,
        value: warehouseData?.total_assets || 0,
        label: t("dashboard.warehouseManager.totalAssets"),
        colorClass: "bg-blue-500",
      },
      {
        icon: FaCalendarAlt,
        value: warehouseData?.total_maintenance_costs || 0,
        label: t("dashboard.warehouseManager.totalMaintenanceCosts"),
        colorClass: "bg-blue-500",
      },
      {
        icon: FaExclamationTriangle,
        value: warehouseData?.assets_under_maintenance || 0,
        label: t("dashboard.warehouseManager.assetsUnderMaintenance"),
        colorClass: "bg-green-500",
      },
      {
        icon: FaShieldAlt,
        value: warehouseData?.capacity || 0,
        label: t("dashboard.warehouseManager.capacity"),
        colorClass: "bg-yellow-500",
      },
    ];
  }, [dashboardData, role, t]);

  const finance_ManagerItem = useMemo(() => {
    if (role !== "finance_manager") return [];
    if (!dashboardData?.financial_overview) return [];

    const financeData = dashboardData?.financial_overview;

    return [
      {
        icon: FaMoneyBill,
        value: financeData?.total_purchase_price || 0,
        label: t("dashboard.financeManager.totalPurchasePrice"),
        colorClass: "bg-blue-500",
      },
      {
        icon: FaChartLine,
        value: financeData?.total_depreciation || 0,
        label: t("dashboard.financeManager.totalDepreciation"),
        colorClass: "bg-yellow-500",
      },
      {
        icon: FaShieldAlt,
        value: financeData?.total_insurance_costs || 0,
        label: t("dashboard.financeManager.totalInsuranceCosts"),
        colorClass: "bg-green-500",
      },
      {
        icon: FaTools,
        value: financeData?.total_maintenance_costs || 0,
        label: t("dashboard.financeManager.totalMaintenanceCosts"),
        colorClass: "bg-blue-500",
      },
    ];
  }, [dashboardData, role, t]);

  // Helper function to render stat cards
  const renderStatCards = (items) => {
    return items.map((item, index) => (
      <div
        key={index}
        className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2"
      >
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
          <div className={`${item.colorClass} p-3 rounded-full mr-4 text-white`}>
            <item.icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800">{item.value}</span>
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div key={updateKey} className="flex flex-wrap -mx-2">
      {renderStatCards(assetsItems)}
      {renderStatCards(customer_ManagerItem)}
      {renderStatCards(warehouse_ManagerItem)}
      {renderStatCards(finance_ManagerItem)}
    </div>
  );
};

export default StatCard;