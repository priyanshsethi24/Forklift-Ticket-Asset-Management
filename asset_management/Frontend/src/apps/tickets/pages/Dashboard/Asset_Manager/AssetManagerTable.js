/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Pagination from "../../../../../SharedComponent/Pagination";
import { FaEdit, FaEye, FaTrash, FaPhone, FaHeart, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaStreetView, FaIdCard } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import style from "./../AssetManagerDashboard.module.css";
import AssetUpdateModal from "../../../../../components/common/AssetUpdateModal";
import {
  deleteProtected,
  getProtected,
} from "../../../../../network/ApiService";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import Button from "../../../../../SharedComponent/Button/Button";
import CreateAssetMaintainance from "./CreateAssetMaintainance";
import EditMaintainanceAssetModal from "./EditMaintainanceAssetModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AssetManagerTable = (props) => {
  const {
    totalAssets,
    allAssets,
    limit,
    currentPage,
    setCurrentPage,
    setViewAssetId,
    handleDeleteAsset,
  } = props;
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMaintainance, setSelectedMaintainance] = useState(null);
  const navigate = useNavigate();

  return (
    <div className=" mx-auto ">
   <div className="flex flex-col space-y-6">
  {allAssets?.map((asset, index) => (
    <div 
      className="bg-white -xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden w-full" 
      key={index}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Asset Image Section */}
        <div className="relative lg:w-1/3 xl:w-1/4 flex-shrink-0">
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold -full z-10 ${
              asset.status === "Miete"
                ? "bg-blue-600 text-white"
                : asset.status === "Used"
                ? "bg-amber-500 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {asset?.status}
          </span>
          <div className="relative h-48 sm:h-56 lg:h-full w-full">
            <img
              src="/images/truckImage.jpg"
              className="absolute inset-0 w-full h-full object-cover"
              alt={`${asset.manufacturer || 'Asset'}`}
            />
          </div>
        </div>
        
        {/* Asset Details Section */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6">
          {/* Header: ID and Status Tags */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <div
              className="text-xl font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors duration-200"
              onClick={() => setSelectedMaintainance(asset)}
            >
              Asset Id : {asset?.id}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 -md text-sm font-medium text-gray-700">
                {asset?.condition}
              </span>
              {asset?.operating_hours && (
                <span className="bg-gray-100 px-2 py-1 -md text-sm font-medium text-gray-700">
                  {asset?.operating_hours} hrs
                </span>
              )}
            </div>
          </div>
          
          {/* Asset Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">{asset?.description}</p>
          
          {/* Asset Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center">
              <FaTruck className="text-gray-500 mr-2 flex-shrink-0" />
              <p className="font-medium truncate">{asset?.manufacturer}</p>
            </div>
            <div className="flex items-center">
              <FaIdCard className="text-gray-500 mr-2 flex-shrink-0" />
              <p className="truncate">Serial No.: <span className="font-medium">{asset?.serial_no}</span></p>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500 mr-2 flex-shrink-0" />
              <p className="truncate">Manufactured: <span className="font-medium">{asset?.insert_date}</span></p>
            </div>
            <div className="flex items-center">
              <FaClock className="text-gray-500 mr-2 flex-shrink-0" />
              <p className="truncate">Operating hours: <span className="font-medium">{asset?.operating_hours}</span></p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-3 mt-2 border-t border-gray-100 flex justify-end">
            <div className="flex gap-2 sm:gap-3">
              <button
                className="p-2 sm:p-2.5 bg-blue-500 text-white -lg hover:bg-blue-600 transition flex items-center justify-center"
                onClick={() => setViewAssetId(asset.id)}
                title={t("assets.actions.view")}
              >
                <FaEye className="text-base sm:text-lg" />
              </button>
              <button
                className="p-2 sm:p-2.5 bg-amber-500 text-white -lg hover:bg-amber-600 transition flex items-center justify-center"
                onClick={() => navigate(`/edit-asset-new/${asset.id}`)}
                title={t("assets.actions.edit")}
              >
                <FaEdit className="text-base sm:text-lg" />
              </button>
              <button
                className="p-2 sm:p-2.5 bg-red-500 text-white -lg hover:bg-red-600 transition flex items-center justify-center"
                onClick={() => handleDeleteAsset(asset)}
                title={t("assets.actions.delete")}
              >
                <FaTrash className="text-base sm:text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
    
    {allAssets.length === 0 ? (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-700">No Assets Available</h2>
      </div>
    ) : (
      ""
    )}
    
    <div className="flex justify-center my-6">
      <Pagination
        totalItems={totalAssets}
        setItemOffset={setCurrentPage}
        itemOffset={currentPage}
        limit={limit}
      />
    </div>
    
    <AssetUpdateModal
      selectedAsset={selectedAsset}
      setSelectedAsset={setSelectedAsset}
      setShowEditModal={setShowEditModal}
      showEditModal={showEditModal}
    />
  </div>
  );
};

export default AssetManagerTable;

const MaintainanceTable = (props) => {
  const { asset } = props;
  const { t } = useTranslation();
  const [allMaintainance, setAllMaintainance] = useState([]);
  const [selectedMaintainance, setSelectedMaintainance] = useState(null);
  const [loader, setLoader] = useState(false);
  const [createMaintainance, setCreateMaintainance] = useState(null);

  useEffect(() => {
    getAllMaintainance();
  }, [asset?.id]);

  const getAllMaintainance = async () => {
    setAllMaintainance([]);
    try {
      if (!asset?.id) return;
      setLoader(true);
      const url = `${API_END_POINTS.assets}${asset?.id}/maintenance_records/`;
      const response = await getProtected(url);
      if (response) {
        setAllMaintainance(response.results || []);
        // setAssetCount(response.count);
        setLoader(false);
      }
    } catch (e) {
      setLoader(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm(t("assets.messages.deleteConfirm"))) return;

    try {
      setLoader(true);
      const url = `${API_END_POINTS.assets}${asset.id}/maintenance/${id}/`;
      const response = await deleteProtected(url);
      if (response) {
        toast.success(t("assets.messages.deleteSuccess"));
        getAllMaintainance();
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.messages;
      if (message?.[0]?.message) {
        toast.error(t("assets.messages.deleteError"));
      }
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      <tr>
        <td colSpan={11} style={{ height: "100px" }}>
          {loader ? (
            <div className="modern-loader"></div>
          ) : !allMaintainance?.length ? (
            <>
              {t("maintenance.noData")}{" "}
              <Button
                onClick={() => {
                  setCreateMaintainance(asset);
                }}
              >
                {t("maintenance.createNew")}
              </Button>
              <CreateAssetMaintainance
                show={createMaintainance}
                onClose={() => {
                  setCreateMaintainance(false);
                  getAllMaintainance();
                }}
              />
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "row", gap: "15px" }}>
              <table style={{ marginLeft: "50px" }}>
                <thead>
                  <tr style={{ minHeight: "200px" }}>
                    <th>
                      <div style={{ minWidth: "max-content" }}>
                        {t("maintenance.fields.id")}
                      </div>
                    </th>
                    <th>
                      <div style={{ minWidth: "max-content" }}>
                        {t("maintenance.fields.details")}
                      </div>
                    </th>
                    <th>
                      <div style={{ minWidth: "max-content" }}>
                        {t("maintenance.fields.date")}
                      </div>
                    </th>
                    <th>
                      <div style={{ minWidth: "max-content" }}>
                        {t("maintenance.fields.cost")}
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
                  {allMaintainance?.map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.id}</td>
                      <td>{asset.details}</td>
                      <td>{asset.date}</td>
                      <td>{asset.cost}</td>
                      <td>
                        <div className={style["action-buttons"]}>
                          <button
                            className={style["btn-edit"]}
                            onClick={() => {
                              setSelectedMaintainance(asset);
                            }}
                            title={t("common.edit")}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className={style["btn-delete"]}
                            onClick={() => handleDeleteAsset(asset.id)}
                            title={t("common.delete")}
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
                    setCreateMaintainance(asset);
                  }}
                >
                  {t("maintenance.createNew")}
                </Button>
              </div>
            </div>
          )}
        </td>
      </tr>
      <CreateAssetMaintainance
        show={createMaintainance}
        onClose={() => {
          setCreateMaintainance(false);
          getAllMaintainance();
        }}
      />
      <EditMaintainanceAssetModal
        show={selectedMaintainance}
        onClose={() => {
          setSelectedMaintainance(null);
          getAllMaintainance();
        }}
        asset={asset}
      />
    </>
  );
};
