import React, { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";
import style from "./../AssetManagerDashboard.module.css";
// import UpdateWarehouse from "../../../../../components/common/UpdateWarehouse";
import ViewWarehouse from "../../../../../components/common/ViewWarehouse";
// import CreateWarehouseModal from "../../../../../components/common/CreateWarehouseModal";
// import Pagination from "../../../../../SharedComponent/Pagination";
import { useSelector, useDispatch } from "react-redux";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";

import { toast } from "react-toastify";
import { setAllWarehouses, selectWarehouseData } from "../../../../../redux/slices/warehouseSlice";
import { objectToQueryParams } from "../../../../../utils/commonHelper";
import StatCard from "../../../../../SharedComponent/Dashboard/StatCard";
import Loading from "../../../../../SharedComponent/Loading";
import Button from "../../../../../SharedComponent/Button/Button";
import { deleteProtected, getProtected } from "../../../../../network/ApiService";
import UpdateWarehousePage from "../../../../../components/common/UpdateWarehousePage";
import CreateWarehousePage from "../../../../../components/common/CreateWarehousePage";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../../../../components/HeroSection/HeroSection";
import Pagination from "../../../../../SharedComponent/Pagination";
import Footer from "../../../../../SharedComponent/Footer/Footer";

const WarehouseTableData = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewWarehouseId, setViewWarehouseId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { allWarehouses, totalWarehouses } = useSelector(selectWarehouseData);
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
  };
  const limit = 5; 
  useEffect(() => {
    fetchWarehouses();
  }, [currentPage, filters]);
  useEffect(() => {
    const filtered = warehouses.filter(warehouse =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredWarehouses(filtered);
  }, [searchQuery, warehouses]);
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const query = {
        page: currentPage + 1,
        page_size: limit,
      };
      if (filters.status) query.status = filters.status; 
      if (searchQuery) {
        if (!isNaN(parseInt(searchQuery))) {
          query.warehouse_id = searchQuery;
        }
      }
      const newQuery = objectToQueryParams(query);
      const url = `${API_END_POINTS.warehouses}?${newQuery}`; 
      const response = await getProtected(url);
      if (response) {
        dispatch(setAllWarehouses(response)); 
        setWarehouses(response); 
      }
    } catch (e) {
      const message = e?.response?.data?.messages;
      if (message && message[0]?.message) {
        toast.error(t("assets.messages.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarehouse = async (id) => {
    const confirmDelete = window.confirm(t("warehouse.deleteConfirm"));
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      const url = `${API_END_POINTS.warehouses}${id}/`;
      const response = await deleteProtected(url);
      
      if (response && response.status === 204) {
        toast.success(t("warehouse.deleteSuccess"));
        fetchWarehouses();
      } else {

        fetchWarehouses();
      }
    } catch (e) {
      console.error("Delete error:", e);
      const message = e?.response?.data?.messages;
      if (message?.[0]?.message) {
        toast.error(t("warehouse.deleteError"));
      } else {
        toast.error(t("warehouse.deleteError"));
      }
    } finally {
      setLoading(false);
    }
  };

  // const Pagination = ({ totalItems, setItemOffset, itemOffset, limit }) => {
  //   const pageCount = Math.ceil(totalItems / limit);
  
  //   const handlePageClick = (page) => {
  //     setItemOffset(page);
  //   };
  
  //   return (
  //     <div>
  //       {Array.from({ length: pageCount }, (_, index) => (
  //         <Button key={index} onClick={() => handlePageClick(index)}>
  //           {index + 1}
  //         </Button>
  //       ))}
  //     </div>
  //   );
  // };
  const handlePageClick = (page) => {
    setCurrentPage(page);
    fetchWarehouses(); 
  };

  return (
    <div className="w-full max-w-full  flex flex-col min-h-screen  bg-gray-50 " >
    <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />

    <Loading loading={loading} text={t("warehouse.loading")} />
     <div className="w-full flex flex-col sm:flex-row justify-between items-center  mt-14 gap-4  bg-white p-4 shadow-md  ">
        <div className="font-medium text-lg ">Your assets</div>
        <div className="w-full sm:w-auto flex justify-center sm:justify-end bg-blue-600 px-3 py-2 text-white ">
          <Button 
            onClick={() => navigate("/create-warehouse")}
            className="flex items-center gap-2"
          >
            <FaPlus className="text-sm" /> 
            <span>{t("warehouse.actions.add")}</span>
          </Button>
        </div>

    </div>
    <div className="w-full overflow-hidden">
      {/* On mobile, show a vertical card-like view for each warehouse */}
      <div className="block md:hidden">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-lg shadow-md mb-4 p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-800">{warehouse.name}</h3>
              <span className="text-sm text-gray-500">ID: {warehouse.id}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm text-gray-600">{t("warehouse.table.capacity")}: {warehouse.capacity}</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => navigate(`/warehouse/${warehouse.id}`)}
                aria-label={t("warehouses.actions.view")}
              >
                <FaEye />
              </button>
              <button
                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                onClick={() => navigate(`/update-warehouse/${warehouse.id}`)}
                aria-label={t("warehouses.actions.edit")}
              >
                <FaEdit />
              </button>
              <button
                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => handleDeleteWarehouse(warehouse.id)}
                aria-label={t("warehouses.actions.delete")}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* On tablet and larger screens, show table view */}
      <div className=" hidden  md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("warehouse.table.warehouseId")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("warehouse.table.warehouseName")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("warehouse.table.capacity")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warehouse.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      onClick={() => navigate(`/warehouse/${warehouse.id}`)}
                      aria-label={t("warehouses.actions.view")}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => navigate(`/update-warehouse/${warehouse.id}`)}
                      aria-label={t("warehouses.actions.edit")}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      onClick={() => handleDeleteWarehouse(warehouse.id)}
                      aria-label={t("warehouses.actions.delete")}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div >
          {/* <Pagination
            totalItems={totalWarehouses} 
            setItemOffset={setCurrentPage} 
            itemOffset={currentPage} 
            limit={limit} 
          /> */}

          <Pagination totalItems={totalWarehouses} 
            setItemOffset={setCurrentPage} 
            itemOffset={currentPage} 
            limit={limit}  />

            

         


        </div>

        
    </div>

    <Footer/>
       
        {/* <CreateWarehouseModal show={showModal} onClose={() => setShowModal(false)} /> */}
        {/* {viewWarehouseId && <ViewWarehouse id={viewWarehouseId} setViewWarehouseId={setViewWarehouseId} />} */}
        {/* {editWarehouse && <UpdateWarehouse editWarehouse={editWarehouse} onClose={() => setEditWarehouse(null)} />} */}
      </div>
  );
};

export default WarehouseTableData;
