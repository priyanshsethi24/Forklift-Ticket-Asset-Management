/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import StatCard from "../../../../../SharedComponent/Dashboard/StatCard";
import { FaEdit, FaEye, FaPlus, FaTrash, FaChartLine , FaRegCopyright} from "react-icons/fa";
import Button from "../../../../../SharedComponent/Button/Button";
import style from "./../AssetManagerDashboard.module.css";
import { useTranslation } from "react-i18next";
import Pagination from "../../../../../SharedComponent/Pagination";
import { Navbar, Nav,Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCustomerData,
  setAllCustomer,
} from "../../../../../redux/slices/customerSlice";
import CreateCustomerPage from "../../../../../components/common/CreateCustomerPage";
import UpdateCustomerPage from "../../../../../components/common/UpdateCustomerPage";
import { toast } from "react-toastify";
import { objectToQueryParams } from "../../../../../utils/commonHelper";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import { getProtected, deleteProtected } from "../../../../../network/ApiService";
import Loading from "../../../../../SharedComponent/Loading";
import useDebounce from "../../../../../hooks/useDebounce";
import ViewCustomer from "../../../../../components/common/ViewCustomer";
import UpdateCustomerModal from "../../../../../components/common/UpdateCustomerModal";
import ViewSales from '../../../../../components/common/ViewSales';
import { getLanguage } from "../../../../../redux/slices/languageSlice";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../../../../components/HeroSection/HeroSection";
import Footer from "../../../../../SharedComponent/Footer/Footer";
const limit = 5;
const Customers = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const { allCustomer, totalCustomer } = useSelector(selectCustomerData);
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [loader, setLoader] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const { currentLanguages } = useSelector(getLanguage);
  const [filteredCustomers, setFilteredCustomers] = useState(allCustomer);
  const navigate = useNavigate();
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    setCurrentPage(1);
  };
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery !== undefined || debouncedQuery !== null) {
      setCurrentPage((pre) => 0);
      fetchCustomers();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, filters.status, currentLanguages]);

  useEffect(() => {
    const filtered = allCustomer.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, allCustomer]);

  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoader(true);
      const query = {
        page: currentPage + 1,
        page_size: limit,
        language: currentLanguages
      };

      if (filters.status) query.status = filters.status;
      if (searchQuery?.trim()) {
        if (!isNaN(parseInt(searchQuery[0]))) {
          query.customer_name = searchQuery;
        }
      }

      const newQuery = objectToQueryParams(query);
      const url = `${API_END_POINTS.customers}?${newQuery}`;
      const response = await getProtected(url);

      if (response) {
        dispatch(setAllCustomer(response));
      }
    } catch (e) {
      const message = e?.response?.data?.messages;
      if (message?.[0]?.message) {
        toast.error(t("assets.messages.fetchError"));
      }
    } finally {
      setLoader(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(t("assets.messages.deleteConfirm"))) return;

    try {
      setLoader(true);
      const query = `language=${currentLanguages}`;
      const url = `${API_END_POINTS.customers}${customer.id}/?${query}`;
      const response = await deleteProtected(url);
      
      if (response) {
        toast.success(t("assets.messages.deleteSuccess"));
        fetchCustomers();
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
    <div className="dashboard-container w-full max-w-full  flex flex-col min-h-screen  bg-gray-50" >
      {/* <StatCard /> */}
      <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
      <Loading loading={loader} text={t("common.loading.data")} />

      <div className="w-full bg-white p-4 flex flex-col md:flex-row md:items-center justify-between mt-16 ">
  <div className="mb-4 md:mb-0">
    <h1 className="text-xl md:text-2xl font-semibold">{t("createAsset.buttons.YourTickets")}</h1>
  </div>
  <div className="flex flex-col sm:flex-row gap-3">
    <Button 
      onClick={() => setShowSalesModal(true)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2  flex items-center justify-center"
    >
      <FaChartLine className="mr-2" /> {t("common.salesReport")}
    </Button>
    <Button 
      onClick={() => navigate("/create-customer")}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2  flex items-center justify-center"
    >
      <FaPlus className="mr-2" /> {t("customers.actions.create")}
    </Button>
  </div>
  </div>

      {/* Responsive Customer Table */}
<div className="w-full px-4">
  {/* Mobile View (cards) - Show on small screens, hide on medium and up */}
  <div className="md:hidden">
    {filteredCustomers.map((customer) => (
      <div key={customer.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-800">{customer.name}</span>
          <span className="text-sm text-gray-500">ID: {customer.id}</span>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{t("customers.table.contact_Information")}</span>
            <span className="text-sm">{customer.contact_information}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">{t("customers.table.transaction_History")}</span>
            <span className="text-sm">{customer.transaction_history}</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            onClick={() => setViewCustomerId(customer)}
            title="View"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
            onClick={() => {
              navigate(`/update-customer/${customer.id}`);
            }}
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            onClick={() => handleDeleteCustomer(customer)}
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
  
  {/* Desktop View (table) - Hide on small screens, show on medium and up */}
  <div className="hidden md:block w-full overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="whitespace-nowrap">{t("customers.table.customer_Id")}</div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="min-w-[150px]">{t("customers.table.contact_Information")}</div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="whitespace-nowrap">{t("customers.table.transaction_History")}</div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="whitespace-nowrap">{t("customers.table.customer_Name")}</div>
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="whitespace-nowrap">{t("common.actions")}</div>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredCustomers.map((customer) => (
          <tr key={customer.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.id}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{customer.contact_information}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{customer.transaction_history}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.name}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                  onClick={() => setViewCustomerId(customer)}
                  title="View"
                >
                  <FaEye className="w-4 h-4" />
                </button>
                <button
                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-100 transition-colors"
                  onClick={() => {
                    navigate(`/update-customer/${customer.id}`);
                  }}
                  title="Edit"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                  onClick={() => handleDeleteCustomer(customer)}
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
  {/* Pagination - visible on all screen sizes */}
  <div className="flex justify-center my-4 w-full">
    <Pagination
      totalItems={totalCustomer}
      setItemOffset={setCurrentPage}
      itemOffset={currentPage}
      limit={limit}
    />
  </div>
</div>
  {<Footer/>}

     
      {viewCustomerId && (
        <ViewCustomer
          id={viewCustomerId}
          setViewCustomerId={setViewCustomerId}
        />
      )}
      {editCustomer && (
        <UpdateCustomerPage
          editCustomer={editCustomer}
          onClose={setEditCustomer}
        />
      )}
      {showSalesModal && (
        <ViewSales 
          showModal={showSalesModal} 
          setShowModal={setShowSalesModal}
        />
      )}
        
    </div>
  );
};

export default Customers;
