/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Pagination from "../../../../../SharedComponent/Pagination";
import style from "./../AssetManagerDashboard.module.css";
import { useTranslation } from "react-i18next";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import {
  deleteProtected,
  getProtected,
} from "../../../../../network/ApiService";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import Button from "../../../../../SharedComponent/Button/Button";
import EditFinanceAssetModal from "../../../../../components/common/EditFinanceAssetModal";
import { formatCurrency } from "../../../../../utils/formatters";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreateFinanceAssetPage from "../../../../../components/common/CreateFinanceAssetPage";

const FinanceTableData = ({ asset, ...props }) => {
  const { totalAssets, allAssets, limit, currentPage, setCurrentPage } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFinanceAsset, setSelectedFinanceAsset] = useState(null);
  const [grandTotals, setGrandTotals] = useState({
    bookValue: 0,
    purchasePrice: 0,
    depreciation: 0,
    insurance: 0
  });

  useEffect(() => {
    const calculateGrandTotals = async () => {
      try {

          const totals = allAssets.reduce((acc, asset) => ({
          bookValue: acc.bookValue + (parseFloat(asset.book_value) || 0),
          purchasePrice: acc.purchasePrice + (parseFloat(asset.purchase_price) || 0),
          depreciation: acc.depreciation + (parseFloat(asset.total_depreciation) || 0),
          insurance: acc.insurance + (parseFloat(asset.total_insurance_costs) || 0)
        }), {
          bookValue: 0,
          purchasePrice: 0,
          depreciation: 0,
          insurance: 0
        });

        setGrandTotals(totals);
      } catch (error) {
        console.error('Error fetching grand totals:', error);
      }
    };

    calculateGrandTotals();
  }, []);

  const calculateTotals = (assets) => {
    return assets?.reduce((acc, asset) => ({
      totalBookValue: acc.totalBookValue + (parseFloat(asset.book_value) || 0),
      totalPurchase: acc.totalPurchase + (parseFloat(asset.purchase_price) || 0),
      totalDepreciation: acc.totalDepreciation + (parseFloat(asset.total_depreciation) || 0),
      totalInsurance: acc.totalInsurance + (parseFloat(asset.total_insurance_costs) || 0),
      totalMaintenance: acc.totalMaintenance + (parseFloat(asset.total_maintenance_costs) || 0),
      totalOperating: acc.totalOperating + (parseFloat(asset.total_operating_costs) || 0),
    }), {
      totalBookValue: 0,
      totalPurchase: 0,
      totalDepreciation: 0,
      totalInsurance: 0,
      totalMaintenance: 0,
      totalOperating: 0,
    });
  };

  const totals = calculateTotals(allAssets);

  return (
    <div className="w-full overflow-x-auto">
  <div className="min-w-full shadow rounded-lg overflow-hidden">
    {/* Table for medium devices and up */}
    <table className="min-w-full bg-white hidden md:table">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("assets.fields.id")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("assets.fields.description")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("assets.fields.brand")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("assets.fields.model")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.book_Value")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.purchase_Price")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.total_Depreciation")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.total_Insurance_Costs")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.total_Maintenance_Costs")}
          </th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {t("finance.table.total_Operating_Costs")}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {allAssets?.map((asset, index) => [
          <tr
            key={index}
            onClick={() =>
              setSelectedFinanceAsset((pre) => (pre?.id === asset.id ? null : asset))
            }
            className="hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <td className="py-3 px-4 text-sm text-gray-900">{asset.id}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.description}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.brand}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.model}</td>
            <td className="py-3 px-4 text-sm text-gray-900 text-center">{asset.book_value}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.purchase_price}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.total_depreciation}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.total_insurance_costs}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.total_maintenance_costs}</td>
            <td className="py-3 px-4 text-sm text-gray-900">{asset.total_operating_costs}</td>
          </tr>,
          selectedFinanceAsset && selectedFinanceAsset.id === asset?.id && (
            <tr key={(index + 1) * 500}>
              <td colSpan="10" className="p-0">
                <FinanceTable asset={selectedFinanceAsset} />
              </td>
            </tr>
          ),
        ])}
        <tr className="bg-gray-50 font-medium">
          <td colSpan="4" className="py-3 px-4 text-sm text-gray-900">
            <strong>{t("finance.table.totals")}</strong>
          </td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalBookValue)}</td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalPurchase)}</td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalDepreciation)}</td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalInsurance)}</td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalMaintenance)}</td>
          <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(totals.totalOperating)}</td>
        </tr>
      </tbody>
    </table>

    {/* Card-based view for small screens */}
    <div className="md:hidden">
      {allAssets?.map((asset, index) => (
        <div key={index} className="border-b border-gray-200 last:border-b-0">
          <div 
            onClick={() => setSelectedFinanceAsset((pre) => (pre?.id === asset.id ? null : asset))}
            className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">ID: {asset.id}</span>
              <span className="text-sm text-gray-700">{asset.brand} {asset.model}</span>
            </div>
            <div className="text-sm text-gray-900 mb-3">{asset.description}</div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-500">{t("finance.table.book_Value")}</div>
                <div className="font-medium">{asset.book_value}</div>
              </div>
              <div>
                <div className="text-gray-500">{t("finance.table.purchase_Price")}</div>
                <div className="font-medium">{asset.purchase_price}</div>
              </div>
              <div>
                <div className="text-gray-500">{t("finance.table.total_Depreciation")}</div>
                <div className="font-medium">{asset.total_depreciation}</div>
              </div>
              <div>
                <div className="text-gray-500">{t("finance.table.total_Insurance_Costs")}</div>
                <div className="font-medium">{asset.total_insurance_costs}</div>
              </div>
              <div>
                <div className="text-gray-500">{t("finance.table.total_Maintenance_Costs")}</div>
                <div className="font-medium">{asset.total_maintenance_costs}</div>
              </div>
              <div>
                <div className="text-gray-500">{t("finance.table.total_Operating_Costs")}</div>
                <div className="font-medium">{asset.total_operating_costs}</div>
              </div>
            </div>
          </div>
          
          {selectedFinanceAsset && selectedFinanceAsset.id === asset?.id && (
            <div className="px-4 py-2 bg-gray-50">
              <FinanceTable asset={selectedFinanceAsset} />
            </div>
          )}
        </div>
      ))}

      {/* Totals card for mobile */}
      <div className="p-4 bg-gray-100">
        <div className="text-base font-bold mb-3">{t("finance.table.totals")}</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-500">{t("finance.table.book_Value")}</div>
            <div className="font-medium">{formatCurrency(totals.totalBookValue)}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("finance.table.purchase_Price")}</div>
            <div className="font-medium">{formatCurrency(totals.totalPurchase)}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("finance.table.total_Depreciation")}</div>
            <div className="font-medium">{formatCurrency(totals.totalDepreciation)}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("finance.table.total_Insurance_Costs")}</div>
            <div className="font-medium">{formatCurrency(totals.totalInsurance)}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("finance.table.total_Maintenance_Costs")}</div>
            <div className="font-medium">{formatCurrency(totals.totalMaintenance)}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("finance.table.total_Operating_Costs")}</div>
            <div className="font-medium">{formatCurrency(totals.totalOperating)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Pagination */}
  <div className="flex justify-center my-4">
    <Pagination
      totalItems={totalAssets}
      setItemOffset={setCurrentPage}
      itemOffset={currentPage}
      limit={limit}
    />
  </div>
</div>
  );
};

export default FinanceTableData;

const FinanceTable = (props) => {
  const { asset } = props;
  const { currentLanguages } = useSelector((state) => state.language);
  const [allFinance, setAllFinance] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loader, setLoader] = useState(null);
  const [createFinance, setCreateFinance] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => {
    getAllFinance();
  }, [asset?.id, currentLanguages]);

  const getAllFinance = async () => {
    setAllFinance([]);
    try {
      if (!asset?.id) return;
      setLoader(true);
      const query = `language=${currentLanguages}`;
      const url = `${API_END_POINTS.financeReport}${asset?.id}/?${query}`;
      const response = await getProtected(url);
      if (response) {
        setAllFinance(response);
        setLoader(false);
      }
    } catch (e) {
      setLoader(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    try {
      setLoader(true);
      const query = `language=${currentLanguages}`;
      const url = `${API_END_POINTS.financeReport}${asset.id}/${id}/?${query}`;
      const response = await deleteProtected(url);
      if (response) {
        getAllFinance();
      }
    } catch (e) {
      setLoader(false);
    }
  };

  const calculateMetrics = (financeData) => {
    const totalCosts = financeData.reduce((acc, item) => ({
      depreciation: acc.depreciation + (parseFloat(item.depreciation) || 0),
      maintenance: acc.maintenance + (parseFloat(item.maintenance_costs) || 0),
      operating: acc.operating + (parseFloat(item.operating_costs) || 0),
    }), { depreciation: 0, maintenance: 0, operating: 0 });

    return {
      ...totalCosts,
      totalExpenses: totalCosts.maintenance + totalCosts.operating,
      monthlyAverage: (totalCosts.maintenance + totalCosts.operating) / (financeData.length || 1),
    };
  };

  const metrics = calculateMetrics(allFinance);

  if (loader) {
    return (
      <tr>
        <td colSpan={11} style={{ height: "100px" }}>
          <div className="modern-loader"></div>
        </td>
      </tr>
    );
  } else if (!loader && allFinance?.length === 0) {
    return (
      <tr>
        <td colSpan={11} style={{ height: "100px" }}>
          {t("finance.actions.noDataFound")}{" "}
          <Button onClick={() => navigate('/create-finance-asset')}>
            + 
            {t("finance.actions.createOne")}
          </Button>
          
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr>
        <td colSpan={11} style={{ minHeight: "100px" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
            <table style={{ marginLeft: "50px" }}>
              <thead>
                <tr style={{ minHeight: "200px" }}>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.financeId")}</div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.assetName")}</div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.date")}</div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.notes")}</div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.depreciation")}</div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>
                      {t("finance.table.maintenanceCosts")}
                    </div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>
                      {t("finance.table.operatingCosts")}
                    </div>
                  </th>
                  <th>
                    <div style={{ minWidth: "max-content" }}>{t("finance.table.actions")}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {allFinance?.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id}</td>
                    <td>{asset.asset_name}</td>
                    <td>{asset.date}</td>
                    <td>{asset.notes}</td>
                    <td>{asset.depreciation}</td>
                    <td>{asset.maintenance_costs}</td>
                    <td>{asset.operating_costs}</td>
                    <td>
                      <div className={style["action-buttons"]}>
                        <button
                          className={style["btn-edit"]}
                          onClick={() => {
                            setSelectedAsset(asset);
                            navigate(`/update-finance-asset/${asset.id}`);
                          }}
                          title={t("finance.actions.edit")}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={style["btn-delete"]}
                          onClick={() => handleDeleteAsset(asset.id)}
                          title={t("finance.actions.delete")}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <Button
                onClick={() => {
                  setCreateFinance(asset);
                }}
              >
                + {t("finance.actions.createNew")}
              </Button>

            </div>
          </div>
        </td>
      </tr>
      
      <CreateFinanceAssetPage
        show={createFinance}
        onClose={() => {
          setCreateFinance(false);
          getAllFinance();
        }}
      />
      <EditFinanceAssetModal
        show={selectedAsset}
        onClose={() => {
          setSelectedAsset(null);
          getAllFinance();
        }}
        asset={asset}
      />
    </>
  );
};
