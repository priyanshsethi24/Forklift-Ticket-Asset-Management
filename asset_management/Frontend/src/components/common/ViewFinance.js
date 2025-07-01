import React, { useEffect, useState } from "react";
import { FaTimes, FaChartLine, FaMoneyBill, FaCalculator } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";

import { Modal } from "react-bootstrap";

const ViewFinance = (props) => {
  const { showModal, setShowModal, assetId } = props;
  const [financialData, setFinancialData] = useState({
    depreciation: {},
    expenses: {},
    summary: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('depreciation');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!showModal) return;
      
      setLoading(true);
      try {
        const response = await getProtected(API_END_POINTS.financeSummary);
        if (response) {
          setFinancialData(response);
        }
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setError(t('viewFinance.errorMessage') || 'Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [showModal, t]);

  const renderDepreciationReport = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>{t('viewFinance.depreciation.title')}</h3>
        <p className="report-subtitle">{t('viewFinance.depreciation.subtitle')}</p>
      </div>
      <div className="report-details depreciation-grid">
        <div className="stat-card total-value">
          <div className="stat-icon"><FaMoneyBill /></div>
          <div className="stat-info">
            <h4>{t('viewFinance.depreciation.totalValue.title')}</h4>
            <span className="stat-value">
              ${financialData?.depreciation?.total_asset_value?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        
        <div className="stat-card average-value">
          <div className="stat-icon"><FaCalculator /></div>
          <div className="stat-info">
            <h4>{t('viewFinance.depreciation.averageValue.title')}</h4>
            <span className="stat-value">
              ${financialData?.depreciation?.average_asset_value?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="stat-card total-assets">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-info">
            <h4>{t('viewFinance.depreciation.totalAssets.title')}</h4>
            <span className="stat-value">
              {financialData?.summary?.total_assets || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExpensesReport = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>{t('viewFinance.expenses.title')}</h3>
        <p className="report-subtitle">{t('viewFinance.expenses.subtitle')}</p>
      </div>
      <div className="report-details">
        <p className="detail-row">
          <strong>{t('viewFinance.expenses.maintenanceCosts')}: </strong>
          <span className="detail-value">
            ${financialData?.expenses?.maintenance_costs?.toLocaleString() || 0}
          </span>
        </p>
        <p className="detail-row">
          <strong>{t('viewFinance.expenses.operatingCosts')}: </strong>
          <span className="detail-value">
            ${financialData?.expenses?.operating_costs?.toLocaleString() || 0}
          </span>
        </p>
        <p className="detail-row">
          <strong>{t('viewFinance.expenses.insuranceCosts')}: </strong>
          <span className="detail-value">
            ${financialData?.expenses?.insurance_costs?.toLocaleString() || 0}
          </span>
        </p>
        <p className="detail-row">
          <strong>{t('viewFinance.expenses.totalAnnual')}: </strong>
          <span className="detail-value">
            ${financialData?.expenses?.total_annual_expenses?.toLocaleString() || 0}
          </span>
        </p>
      </div>
    </div>
  );

  const renderROIReport = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>{t('viewFinance.roi.title')}</h3>
        <p className="report-subtitle">{t('viewFinance.roi.subtitle')}</p>
      </div>
      <div className="report-details roi-grid">
        <div className="stat-card total-expenses">
          <div className="stat-info">
            <h4>{t('viewFinance.roi.totalExpenses')}</h4>
            <span className="stat-value">
              ${financialData?.summary?.total_expenses?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="stat-card avg-cost">
          <div className="stat-info">
            <h4>{t('viewFinance.roi.averageCost')}</h4>
            <span className="stat-value">
              ${financialData?.summary?.average_cost_per_asset?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="stat-card total-assets">
          <div className="stat-info">
            <h4>{t('viewFinance.roi.totalAssets')}</h4>
            <span className="stat-value">
              {financialData?.summary?.total_assets || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'depreciation',
      label: t('viewFinance.tabs.depreciation'),
      icon: <FaCalculator />
    },
    {
      id: 'expenses',
      label: t('viewFinance.tabs.expenses'),
      icon: <FaMoneyBill />
    },
    {
      id: 'roi',
      label: t('viewFinance.tabs.roi'),
      icon: <FaChartLine />
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'depreciation':
        return t('viewFinance.titles.depreciation');
      case 'expenses':
        return t('viewFinance.titles.expenses');
      case 'roi':
        return t('viewFinance.titles.roi');
      default:
        return t('viewFinance.titles.default');
    }
  };

  if (!showModal) return null;

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <div className="modal-header">
        <h2 className="">{getTabTitle()}</h2>
        <button className="close-button" onClick={() => setShowModal(false)}>
          <FaTimes />
        </button>
      </div>

      <Modal.Body>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="tabs-container">
              <div className="tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tab-content">
              {activeTab === 'depreciation' && renderDepreciationReport()}
              {activeTab === 'expenses' && renderExpensesReport()}
              {activeTab === 'roi' && renderROIReport()}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ViewFinance; 