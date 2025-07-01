import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { getProtected, patchProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const UpdateWarehousePage = ({ editWarehouse, onClose }) => {
  const { t } = useTranslation();
  const [values, setValues] = useState({});
  const navigate = useNavigate() ; 
  const params = useParams() ; 

  useEffect(() => {
    setValues({ ...editWarehouse });
  }, [editWarehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const [newWarehouse, setNewWarehouse] = React.useState({
    name: '',
    manager: '',
    capacity: '',
    description: ''
  });

  const handleUpdateWarehouse = async () => {
    console.log("params = " , params) ; 
    const id  = params.id
    try {
      // Only send changed fields
      const payload = {};
      Object.entries(values).forEach(([key, value]) => {
        if (value !== editWarehouse[key]) {
          payload[key] = value;
        }
      });

      // Return if no changes made
      if (Object.keys(payload).length === 0) {
        return;
      }

      const url = `${API_END_POINTS.warehouses}${id}/`;
      const response = await patchProtected(url, payload);
      
      if (response) {
        navigate('/dashboard'); 
        toast.success(t("warehouse.updateSuccess"));
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        toast.error(t("warehouse.updateError"));
      }
    }
  };

  useEffect(() => {
    setValues({ ...editWarehouse });
  }, [editWarehouse]);
  useEffect(() => {
    fetchWarehouseById() ;
  } , [] ) ; 

  const fetchWarehouseById = async () => {
    const id = params.id ; 
    try{

      const url = `${API_END_POINTS.warehouses}${id}/`;
      const response = await getProtected(url);
      console.log("response = ",  response)  ; 
    }
    catch(e) 
    {
      console.log("err"  , e );  
      console.error(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        // toast.error(t("warehouse.updateError"));
        toast.error("warehouse get error") ; 
      }
    }
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white -lg shadow-md p-6 md:p-8  mt-5 ">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
          {/* {t("warehouse.createTitle")} */}
          Update Warehouse
        </h2>
        
        <form onSubmit={handleUpdateWarehouse} className="space-y-6">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t("warehouse.nameLabel")}
              </label>
              <input
                id="name"
                name="name"
                value={newWarehouse.name}
                onChange={handleChange}
                required
                placeholder={t("warehouse.namePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Manager Field */}
            <div>
              <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                {t("warehouse.managerLabel")}
              </label>
              <input
                id="manager"
                name="manager"
                value={newWarehouse.manager}
                onChange={handleChange}
                required
                placeholder={t("warehouse.managerPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Capacity Field */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                {t("warehouse.capacityLabel")}
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                value={newWarehouse.capacity}
                onChange={handleChange}
                required
                placeholder={t("warehouse.capacityPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t("warehouse.descriptionLabel")}
              </label>
              <textarea
                id="description"
                name="description"
                value={newWarehouse.description}
                onChange={handleChange}
                placeholder={t("warehouse.descriptionPlaceholder")}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 -md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 -md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t("warehouse.cancelButton")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent -md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* {t("warehouse.updateButton")} */}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default UpdateWarehousePage; 