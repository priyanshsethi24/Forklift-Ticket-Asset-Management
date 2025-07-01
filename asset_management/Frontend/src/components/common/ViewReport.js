import React, { useEffect, useState } from "react";
import { FaTimes, FaTools, FaClock, FaCheckCircle } from "react-icons/fa";
import { GrStatusGood } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";

import { Modal } from "react-bootstrap";

const ViewReport = (props) => {
  const { showModal, setShowModal } = props;
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('condition'); // 'condition', 'maintenance', 'utilization'
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReport = async () => {
      if (!showModal) return;
      
      setLoading(true);
      try {
        const response = await getProtected(API_END_POINTS.assetSummary);
        if (response) {
          setReport(response);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setError(t('viewReport.errorMessage') || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [showModal, t]);

  const renderConditionReport = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>{t('viewReport.condition.title')}</h3>
        <p className="report-subtitle">{t('viewReport.condition.subtitle')}</p>
      </div>
      <div className="report-details condition-grid">
        <div className="stat-card new">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <h4>{t('viewReport.condition.normal')}</h4>
            <span className="stat-value">{report?.condition_summary?.Normal || 0}</span>
            <span className="stat-label">{t('viewReport.common.assets')}</span>
          </div>
        </div>
        
        <div className="stat-card used">
          <div className="stat-icon">✅</div>
          {/* <div className="stat-icon"><GrStatusGood /></div> */}
          <div className="stat-info">
            <h4>{t('viewReport.condition.good')}</h4>
            <span className="stat-value">{report?.condition_summary?.Good || 0}</span>
            <span className="stat-label">{t('viewReport.common.assets')}</span>
          </div>
        </div>
      </div>
    </div>
  );


  const renderUtilizationReport = () => (
    <div className="report-section">
      <div className="report-header">
        <h3>{t('viewReport.utilization.title')}</h3>
        <p className="report-subtitle">{t('viewReport.utilization.subtitle')}</p>
      </div>
      <div className="report-details utilization-grid">
        <div className="stat-card total-hours">
          <div className="stat-info">
            <h4>{t('viewReport.utilization.totalHours')}</h4>
            <span className="stat-value">
              {report?.utilization?.total_operating_hours?.toLocaleString() || 0}
            </span>
            <span className="stat-label">{t('viewReport.common.hours')}</span>
          </div>
        </div>

        <div className="stat-card average-hours">
          <div className="stat-info">
            <h4>{t('viewReport.utilization.averageHours')}</h4>
            <span className="stat-value">
              {report?.utilization?.average_operating_hours_per_asset?.toFixed(1) || 0}
            </span>
            <span className="stat-label">{t('viewReport.common.hours')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'condition':
        return t('viewReport.tabs.condition.title');
      case 'maintenance':
        return t('viewReport.tabs.maintenance.title');
      case 'utilization':
        return t('viewReport.tabs.utilization.title');
      default:
        return t('viewReport.title');
    }
  };

  const tabs = [
    {
      id: 'condition',
      label: t('viewReport.tabLabels.condition'),
      icon: '🔍'
    },
    {
      id: 'utilization',
      label: t('viewReport.tabLabels.utilization'),
      icon: '📊'
    }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (!showModal) return null;

  return (
    <div className="modal-backdrop">
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <div className="modal-header">
          <h2>{getTabTitle()}</h2>
          <button className="close-button" onClick={() => setShowModal(false)}>
            <FaTimes />
          </button>
        </div>

        <Modal.Body>
          {loading ? (
            <div className="loading">{t('viewReport.loading')}</div>
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
                      onClick={() => handleTabChange(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="tab-content">
                {activeTab === 'condition' && renderConditionReport()}
                {activeTab === 'utilization' && renderUtilizationReport()}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewReport;
