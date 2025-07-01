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
import Modal from "react-bootstrap/Modal";


const initialWarehouse = {
  name: "",
  manager: "",
  capacity: "",
  description: ""
};

const CreateWarehouseModal = ({ show, onClose, onSubmit, fetchWarehouses }) => {
  const { t } = useTranslation();
  const [newWarehouse, setNewWarehouse] = useState({ ...initialWarehouse });
  

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
      console.error('Create warehouse error:', error);

      const nameError = error?.response?.data?.name?.[0];

      if (nameError === "warehouse with this name already exists.") {
        toast.error(t("warehouse.table.duplicateNameError")); 
      } else {
        toast.error(nameError || t("warehouse.createError"));
      }
    }
  };

  if (!show) return null;

  return (
    <Modal show={true} onHide={() => onClose(false)} size="lg">
      <div className="modal-header">
        <h2>{t("warehouse.createTitle")}</h2>
        <button className="close-button" onClick={() => onClose(false)}>
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleCreateWarehouse}>
        <Modal.Body>
          <InputField
            name="name"
            value={newWarehouse.name}
            onChange={handleChange}
            required
            label={t("warehouse.nameLabel")}
            placeholder={t("warehouse.namePlaceholder")}
          />
          <InputField
            name="capacity"
            value={newWarehouse.capacity}
            onChange={handleChange}
            required
            type="number"
            label={t("warehouse.capacityLabel")}
            placeholder={t("warehouse.capacityPlaceholder")}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="close" onClick={() => onClose(false)}>
            {t("warehouse.cancelButton")}
          </Button>
          <Button type="submit">
            {t("warehouse.createButton")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

CreateWarehouseModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  fetchWarehouses: PropTypes.func.isRequired,
};

export default CreateWarehouseModal;