
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";
import React, { useState } from "react";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { postProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const initialWarehouse = {
  name: "",
  manager: "",
  capacity: "",
  description: ""
};

const CreateWarehousePage = ({ show, onClose, onSubmit, fetchWarehouses }) => {
    const { t } = useTranslation();
    const [newWarehouse, setNewWarehouse] = useState({ ...initialWarehouse });
    const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWarehouse((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      const url = API_END_POINTS.warehouses;
      if (!url) {
        throw new Error('API endpoint not defined');
      }

      const warehouseData = {
        ...newWarehouse,
        capacity: parseInt(newWarehouse.capacity, 10),
        manager: parseInt(newWarehouse.manager, 10)
      };
      
      const response = await postProtected(url, warehouseData);
      
      if (response) {
        setNewWarehouse({ ...initialWarehouse });
        toast.success(t("warehouse.createSuccess"));
        onClose(false);
      }
    } catch (error) {
        const nameError = error?.response?.data?.name?.[0];

        if (nameError === "warehouse with this name already exists.") {
          toast.error(t("warehouse.table.duplicateNameError")); 
        } else {
          toast.error(nameError || t("warehouse.createError"));
        }
    }
  };



  return (
    <div className="flex justify-center items-center min-h-screen overflow-y-hidden bg-gray-50 p-2 ">
    <div className="w-full max-w-lg bg-white -lg shadow-md p-6 md:p-8 mt-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">
        {t("warehouse.createTitle")}
      </h2>
      
      <form onSubmit={handleCreateWarehouse} className="space-y-6">
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
            {t("warehouse.createButton")}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};



export default CreateWarehousePage;