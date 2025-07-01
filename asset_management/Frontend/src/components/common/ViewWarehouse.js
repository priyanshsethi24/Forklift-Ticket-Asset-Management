import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectWarehouseData } from "../../redux/slices/warehouseSlice";
import { toast } from "react-toastify";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { useNavigate  , useParams} from "react-router-dom";


const ViewWarehouse = (props) => {
  const { id } = props;
  const [selectedWarehouse, setSelectedWarehouse] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { allWarehouses } = useSelector(selectWarehouseData);
  const { t } = useTranslation();
  const navigate = useNavigate() ; 
  const params = useParams() ; 
  const getWarehouseById = async (id) => {
    
    try {
      const url = `${API_END_POINTS.warehouses}?${id}`;
      const response = await getProtected(url);
      if (response) {
        // setSelectedWarehouse(response); 
        return response;
      }
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
   ;(async () => {
    const warehouseID = params.id;
    if (warehouseID) {
      setShowModal(true);
      try {
        const response = await getWarehouseById(warehouseID);
        if (response) {
          console.log("response = ", response);
          setSelectedWarehouse(response);
        }
      } catch (err) {
        console.log("error => ", err);
      }
    } else {
      toast.error(t("warehouse.view.error"));
      // setViewWarehouseId(null);
    }
   })()
  }, [id, allWarehouses, t]);

  const formatKey = (key) => {
    // Try to get translation first
    const translationKey = `warehouse.view.fields.${key.toLowerCase()}`;
    const translation = t(translationKey);
    
    // If no translation found, format the key as before
    if (translation === translationKey) {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    
    return translation;
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/dashboard') ; 
  };


  if (!showModal) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${showModal ? "block" : "hidden"}`}>
    <div
      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
      onClick={closeModal}
    />
         
    {/* Modal */}
    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between p-4 md:p-5 border-b border-gray-200 bg-white z-10">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          {t("warehouse.view.title")}
        </h2>
        <button
          className="p-1 ml-auto bg-transparent text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={closeModal}
          aria-label="Close"
        >
          <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
                   
      {/* Body */}
      {selectedWarehouse && selectedWarehouse?.length > 0 ? (
        <div className="p-4 md:p-6">
          {selectedWarehouse.map((warehouse, index) => (
            <div 
              key={warehouse?.id || index}
              className="mb-6 last:mb-0 bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-gray-700 font-mono bg-gray-50 p-1 rounded">{warehouse?.id}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-700 font-semibold">{warehouse?.name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="text-gray-700">{warehouse?.capacity}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Manager</p>
                  <p className="text-gray-700">
                    {warehouse?.manager ? (
                      warehouse?.manager
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 bg-gray-50 p-6 rounded-md m-4 md:m-6">
          <p className="text-lg font-medium capitalize">No Data Available</p>
          <p className="text-sm mt-2">No warehouse information to display</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default ViewWarehouse;