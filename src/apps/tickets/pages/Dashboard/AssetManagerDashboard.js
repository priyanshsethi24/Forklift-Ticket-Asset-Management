/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaPlus, FaFileAlt, FaMoneyBillWave, FaChartLine, FaRegCopyright, FaChevronDown } from "react-icons/fa";
import "./AssetManagerDashboard.css";
import { API_END_POINTS } from "../../../../network/apiEndPoint";
import Pagination from "../../../../SharedComponent/Pagination";
import { Navbar, Nav,Container } from "react-bootstrap";
import useDebounce from "../../../../hooks/useDebounce";
import StatCard from "../../../../SharedComponent/Dashboard/StatCard";
import { deleteProtected, getProtected } from "../../../../network/ApiService";
import { objectToQueryParams } from "../../../../utils/commonHelper";
import { toast } from "react-toastify";
import CreateAssetModal from "../../../../components/common/CreateAssetModal";
import AssetUpdateModal from "../../../../components/common/AssetUpdateModal";
import style from "./AssetManagerDashboard.module.css";
import ViewData from "../../../../components/common/ViewData";
import Button from "../../../../SharedComponent/Button/Button";
import { useTranslation } from "react-i18next";
import Loading from "../../../../SharedComponent/Loading";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAssetData,
  setAllAssets,
} from "../../../../redux/slices/assetsSlice";
import FinanceTableData from "./Finance_Manager/FinanceTableData";
import WarehouseTableData from "./WarehouseManager/WarehouseTableData";
import CreateWarehouseModal from "../../../../components/common/CreateWarehouseModal";
import AssetManagerTable from "./Asset_Manager/AssetManagerTable";
import ViewReport from "../../../../components/common/ViewReport";
import ViewFinance from "../../../../components/common/ViewFinance";
import ViewSales from '../../../../components/common/ViewSales';
import { getLanguage } from "../../../../redux/slices/languageSlice";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../../../components/HeroSection/HeroSection.js";
import Footer from "../../../../SharedComponent/Footer/Footer.jsx";
const limit = 5;
 

const AssetManagerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguages } = useSelector(getLanguage);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showLoader, setShowLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const { allAssets, totalAssets } = useSelector(selectAssetData);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });
  const [CurrentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewAssetId, setViewAssetId] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const role = localStorage.getItem("userRole");
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete,setConfirmDelete] = useState(false);
  const [assetTobeDelete , setAssetTobeDelete] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(false);

 
  const handleSearch = () => {
    // console.log("Searching for==>", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
  };
  // Fetch assigned assets
  const fetchAssets = async () => {
    try {
      // setShowLoader(true);
      const query = {
        page: CurrentPage + 1,
        page_size: limit,
        language: currentLanguages,
      };
      if (filters.status) query.status = filters.status;
      if (searchQuery !== undefined || searchQuery !== null) {
        if (!isNaN(parseInt(searchQuery?.[0]))) {
          query.asset_id = searchQuery;
        } else if (searchQuery?.length > 0) {
          query.description = searchQuery;
        }
      }
      const newQuery = objectToQueryParams(query);
      const url = `${API_END_POINTS.assets}?${newQuery}`;
      const response = await getProtected(url);
      if (response) {
        dispatch(setAllAssets(response));
        // setAssets(response.results);
        // setAssetCount(response.count);
        setShowLoader(false);
      }
    } catch (e) {
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t("assets.messages.fetchError"));
      }
      setShowLoader(false);
    } finally {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [CurrentPage, filters.status, currentLanguages]);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery !== undefined || debouncedQuery !== null) {
      setCurrentPage((pre) => 0);
      fetchAssets();
    }
  }, [debouncedQuery]);

  // Handle asset deletion with translations
  const handleDeleteAsset = async (asset) => {
    // if (!window.confirm(t("assets.messages.deleteConfirm"))) {
    //   return;
    // }
    setAssetTobeDelete(asset)
    setShowDeleteModal(true);
 
    // try {
    //   const url = `${API_END_POINTS.assets}${asset.id}/`;
    //   const response = await deleteProtected(url);
    //   if (response) {
    //     fetchAssets();
    //     refreshDashboard();
    //     toast.success(t("assets.messages.deleteSuccess"));
    //   }
    // } catch (e) {
    //   console.log(e);
    //   const message = e?.response?.data?.messages;
    //   if (message && message?.[0]?.message) {
    //     toast.error(t("assets.messages.deleteError"));
    //   }
    // }
  };
  
  const confirmDeleteAsset = async () =>{
    setShowDeleteModal(false);
    const asset = assetTobeDelete;
    try {
      const url = `${API_END_POINTS.assets}${asset.id}/`;
      const response = await deleteProtected(url);
      if (response) {
        fetchAssets();
        refreshDashboard();
        toast.success(t("assets.messages.deleteSuccess"));
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t("assets.messages.deleteError"));
      }
    }
  };

  const getDashboard = async () => {
    try {
      const url = API_END_POINTS.dashboard;
      const response = await getProtected(url);
      if (response) {
        // Update your state or dispatch actions as needed
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t("dashboard.errors.fetchFailed"));
      }
    }
  };

  const refreshDashboard = () => {
    getDashboard(); // Call the function to refresh data
  };

  const handleViewFinance = (assetId) => {
    setSelectedAssetId(assetId);
    setShowFinanceModal(true);
}
  

  const handleEditClick = (asset) => {
    
    navigate(`/edit-asset/${asset.id}`, { state: { assetData: asset } });
  };

  return (
    <>
    <div className="dashboard-container  w-full max-w-full  flex flex-col min-h-screen  bg-gray-50"  >
      {/* Statistics Cards */}
      {/* style={{ height: "auto !important" }} */}
      <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
      <Loading loading={showLoader} text={t("common.loading.assets")} />
      {/* Filters and Search */}
      {/*  p-4 -lg */}
      <div className="w-full bg-white p-4 -lg mt-20  shadow-sm"> 
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div className="w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-xl font-bold">{t("createAsset.buttons.YourTickets")}</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {role !== "warehouse_manager" && (
            <div className="relative w-full sm:w-48">
              <button 
                type="button"
                className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 -md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{filters.status || '--Status--'}</span>
                <FaChevronDown className={`ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 -md shadow-lg">
                  <ul className="py-1 overflow-hidden">
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentPage(0);
                        setFilters({ ...filters, status: '' });
                        setDropdownOpen(false);
                      }}
                    >
                      --Status--
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentPage(0);
                        setFilters({ ...filters, status: 'New' });
                        setDropdownOpen(false);
                      }}
                    >
                      {t("assets.status.New")}
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentPage(0);
                        setFilters({ ...filters, status: 'Used' });
                        setDropdownOpen(false);
                      }}
                    >
                      {t("assets.status.Used")}
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentPage(0);
                        setFilters({ ...filters, status: 'Demo' });
                        setDropdownOpen(false);
                      }}
                    >
                      {t("assets.status.Demo")}
                    </li>
                    <li 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrentPage(0);
                        setFilters({ ...filters, status: 'Rental' });
                        setDropdownOpen(false);
                      }}
                    >
                      {t("assets.status.Rental")}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {role === "asset_manager" && (
              <button 
                onClick={() => setShowReport(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaFileAlt /> {t("assets.actions.viewReport")}
              </button>
            )}
            
            {role === "finance_manager" && (
              <button 
                onClick={() => setShowFinanceModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaMoneyBillWave /> {t("assets.actions.viewFinance")}
              </button>
            )}


            {role === "asset_manager" && (
              <button
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                if(role === "asset_manager"){
                  navigate("/create-asset")
                } else {
                  setShowModal(true)
                }
              }}>
                 <FaPlus />
                 {t("assets.actions.create")}
              </button>
            ) }
            
            {/* {role !== "finance_manager" && (
              <button 
                onClick={() => {
                  if(role === "asset_manager"){
                    navigate("/create-asset")
                  } else {
                    setShowModal(true)
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaPlus />
                {role === "asset_manager" || role === "customer_manager"
                  ? t("assets.actions.create")
                  : t("warehouse.actions.add")}
              </button>
            )}
             */}
            {role === "customer_manager" && (
              <button 
                onClick={() => setShowSalesModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaChartLine /> {t("assets.actions.viewSales")}
              </button>
            )}
          </div>
        </div>
      </div>
    
      {role === "finance_manager" && (
        <>
          <FinanceTableData
            totalAssets={totalAssets}
            allAssets={allAssets}
            limit={limit}
            currentPage={CurrentPage}
            setCurrentPage={setCurrentPage}
            setViewAssetId={setViewAssetId}
            setSelectedAsset={setSelectedAsset}
            setShowEditModal={setShowEditModal}
            handleDeleteAsset={handleDeleteAsset}
            onViewFinance={handleViewFinance}
          />
          <ViewFinance 
            showModal={showFinanceModal}
            setShowModal={setShowFinanceModal}
            assetId={selectedAssetId}
          />
        </>
      )}
      {role === "warehouse_manager" && (
        <WarehouseTableData
          totalAssets={totalAssets}
          allAssets={allAssets}
          limit={limit}
          currentPage={CurrentPage}
          setCurrentPage={setCurrentPage}
          setViewAssetId={setViewAssetId}
          setSelectedAsset={setSelectedAsset}
          setShowEditModal={setShowEditModal}
          handleDeleteAsset={handleDeleteAsset}
        />
      )}
      {role === "asset_manager" && (
        <AssetManagerTable
          totalAssets={totalAssets}d
          allAssets={allAssets}
          limit={limit}
          currentPage={CurrentPage}
          setCurrentPage={setCurrentPage}
          setViewAssetId={setViewAssetId}
          handleDeleteAsset={handleDeleteAsset}
        />
      )}
      {/* Assets Table */}
      {(role === "customer_manager") && (
        <div className={style["assets-table-container"]}>
          <table className={style["assets-table"]}>
            <thead>
              <tr>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.id")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "150px" }}>
                    {t("assets.fields.description")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.status")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.brand")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.model")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.warehouse")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.purchaseDate")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("assets.fields.operatingHours")}
                  </div>
                </th>
                <th>
                  <div style={{ minWidth: "max-content" }}>
                    {t("common.actions")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {allAssets?.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.id}</td>
                  <td>{asset.description}</td>
                  <td>
                    <div
                      className={`${style["status-badge"]} ${
                        style[
                          asset.status === "Miete"
                            ? "completed"
                            : asset.status === "Used" || asset.status === "Gebraucht"
                            ? "in_progress"
                            : "new"
                        ]
                      }`}
                    >
                      {asset.status}
                    </div>
                  </td>
                  <td>{asset.brand}</td>
                  <td>{asset.model}</td>
                  <td style={{ textAlign: "center" }}>{asset.warehouse}</td>
                  <td>{asset.purchase_date}</td>
                  <td>{asset.operating_hours}</td>
                  <td>
                    <div className={style["action-buttons"]}>
                      <button
                        className={style["btn-view"]}
                        onClick={() => setViewAssetId(asset.id)}
                        title={t("assets.actions.view")}
                      >
                        <FaEye />
                      </button>
                      <button
                        className={style["btn-edit"]}
                        onClick={() => handleEditClick(asset)}
                        title={t("assets.actions.edit")}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={style["btn-delete"]}
                        onClick={() => handleDeleteAsset(asset)}
                        title={t("assets.actions.delete")}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              display: "flex",
              width: "100%",
              margin: "15px 0",
              justifyContent: "space-around",
            }}
          >
            <Pagination
              totalItems={totalAssets}
              setItemOffset={setCurrentPage}
              itemOffset={CurrentPage}
              limit={limit}
            />
          </div>

        </div>
        
      )}
       {/* {<Footer/>} */}
      
      <ViewData id={viewAssetId} setViewAssetId={setViewAssetId} />
      {/* Create Asset Modal */}
      {role === "asset_manager" || role === "customer_manager" ? (
        <CreateAssetModal show={showModal} onClose={setShowModal} />
      ) : (
        <CreateWarehouseModal show={showModal} onClose={setShowModal} />
      )}
      {role === "asset_manager" && (
        <ViewReport showModal={showReport} setShowModal={setShowReport} />
      )}
      {showSalesModal && (
        <ViewSales 
          showModal={showSalesModal} 
          setShowModal={setShowSalesModal}
        />
      )}
      
    </div> 
    <Footer/>
    </div>
     {/* Custom Modal */}
     {showDeleteModal && (
        <div className="modal-overlay">
        <div className="modal-delete">
          <p>{t("assets.messages.deleteConfirm")}</p> 
          <div className="modal-actions">
            <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={confirmDeleteAsset}>
              Yes
            </button>
          </div>
        </div>

      </div>
      )}


    </>
  );
};

export default AssetManagerDashboard;
