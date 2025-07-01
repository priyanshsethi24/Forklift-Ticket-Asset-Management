import React, { useEffect, useState } from "react";
import { FaTimes, FaChartLine, FaUsers, FaBoxes, FaMoneyBill, FaChartBar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";

const ViewSales = (props) => {
  const { showModal, setShowModal } = props;
  const [salesData, setSalesData] = useState({
    summary: {},
    offer_metrics: {},
    customer_insights: {},
    asset_metrics: {},
    financial_metrics: {},
    sales_trends: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!showModal) return;
      
      setLoading(true);
      try {
        const response = await getProtected(API_END_POINTS.salesReport);
        if (response) {
          setSalesData(response);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setError(t('viewSales.errorMessage') || 'Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [showModal, t]);

  // If modal is not shown, don't render anything
  if (!showModal) return null;

  const renderSummaryReport = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.summary.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.summary.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div>
            <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.summary.totalSales')}</h4>
            <span className="text-2xl font-bold text-gray-800">
              ${salesData?.summary?.total_sales?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div>
            <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.summary.recentSales')}</h4>
            <span className="text-2xl font-bold text-gray-800">
              ${salesData?.summary?.recent_sales?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div>
            <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.summary.grossProfit')}</h4>
            <span className="text-2xl font-bold text-gray-800">
              ${salesData?.summary?.gross_profit?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div>
            <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.summary.profitMargin')}</h4>
            <span className="text-2xl font-bold text-gray-800">
              {salesData?.summary?.profit_margin?.toFixed(2) || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerInsights = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.customers.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.customers.subtitle')}</p>
      </div>
      <div>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.customers.averageDealSize')}</h4>
          <span className="text-2xl font-bold text-gray-800">
            ${salesData?.customer_insights?.average_deal_size?.toLocaleString() || 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData?.customer_insights?.top_customers?.map((customer, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 text-sm text-gray-800">{customer.customer__name}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">${customer.total_spent?.toLocaleString()}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{customer.deals_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOfferMetrics = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.offers.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.offers.subtitle')}</p>
      </div>
      <div>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.offers.conversionRate')}</h4>
          <span className="text-2xl font-bold text-gray-800">
            {salesData?.offer_metrics?.conversion_rate?.toFixed(2)}%
          </span>
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-700 mb-2">{t('viewSales.tabs.offers.statusDistribution')}</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.offers.table.status')}</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.offers.table.count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData?.offer_metrics?.status_distribution?.map((status, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 text-sm text-gray-800">{status.status}</td>
                    <td className="py-2 px-4 text-sm text-gray-800">{status.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssetMetrics = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.assets.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.assets.subtitle')}</p>
      </div>
      <div>
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.assets.averageOperatingHours')}</h4>
          <span className="text-2xl font-bold text-gray-800">
            {salesData?.asset_metrics?.avg_operating_hours?.toFixed(2) || 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.assets.table.category')}</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.assets.table.revenue')}</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.assets.table.unitsSold')}</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.assets.table.avgPrice')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salesData?.asset_metrics?.category_performance?.map((category, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 text-sm text-gray-800">{category.asset__machine_category}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">${category.total_revenue?.toLocaleString()}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{category.units_sold}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">${category.avg_price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFinancialMetrics = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.financial.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.financial.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.financial.totalCosts')}</h4>
          <span className="text-2xl font-bold text-gray-800">
            ${salesData?.financial_metrics?.total_costs?.toLocaleString() || 0}
          </span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-500">{t('viewSales.tabs.financial.operatingCosts')}</h4>
          <span className="text-2xl font-bold text-gray-800">
            ${salesData?.financial_metrics?.operating_costs?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </div>
  );

  const renderSalesTrends = () => (
    <div className="mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{t('viewSales.tabs.trends.title')}</h3>
        <p className="text-sm text-gray-600">{t('viewSales.tabs.trends.subtitle')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.trends.table.period')}</th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.trends.table.totalSales')}</th>
              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('viewSales.tabs.trends.table.numberOfDeals')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {salesData?.sales_trends?.map((trend, index) => (
              <tr key={index}>
                <td className="py-2 px-4 text-sm text-gray-800">{`${trend.created_at__year}-${trend.created_at__month}`}</td>
                <td className="py-2 px-4 text-sm text-gray-800">${trend.total?.toLocaleString()}</td>
                <td className="py-2 px-4 text-sm text-gray-800">{trend.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'summary', label: t('viewSales.tabLabels.summary'), icon: <FaChartLine /> },
    { id: 'customers', label: t('viewSales.tabLabels.customers'), icon: <FaUsers /> },
    { id: 'offers', label: t('viewSales.tabLabels.offers'), icon: <FaChartBar /> },
    { id: 'assets', label: t('viewSales.tabLabels.assets'), icon: <FaBoxes /> },
    { id: 'financial', label: t('viewSales.tabLabels.financial'), icon: <FaMoneyBill /> },
    { id: 'trends', label: t('viewSales.tabLabels.trends'), icon: <FaChartLine /> }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${showModal ? "visible" : "invisible"}`}>
      {/* Modal backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity ${showModal ? "opacity-50" : "opacity-0"}`} 
        onClick={() => setShowModal(false)}
      />
      
      {/* Modal content */}
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transition-all transform ${showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Modal header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">{t('viewSales.title')}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none" 
            onClick={() => setShowModal(false)}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">{t('viewSales.loading')}</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
          ) : (
            <>
              {/* Tabs for larger screens */}
              <div className="hidden md:block mb-6">
                <div className="flex flex-wrap border-b">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`flex items-center py-2 px-4 focus:outline-none ${
                        activeTab === tab.id 
                          ? "border-b-2 border-blue-500 text-blue-600 font-medium" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropdown for mobile screens */}
              <div className="md:hidden mb-6">
                <select 
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tab content */}
              <div>
                {activeTab === 'summary' && renderSummaryReport()}
                {activeTab === 'customers' && renderCustomerInsights()}
                {activeTab === 'offers' && renderOfferMetrics()}
                {activeTab === 'assets' && renderAssetMetrics()}
                {activeTab === 'financial' && renderFinancialMetrics()}
                {activeTab === 'trends' && renderSalesTrends()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSales;