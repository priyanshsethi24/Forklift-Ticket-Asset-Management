import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { patchProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import { Modal } from "react-bootstrap";

const UpdateWarehouse = ({ editWarehouse, onClose }) => {
  const { t } = useTranslation();
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues({ ...editWarehouse });
  }, [editWarehouse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();

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

      const url = `${API_END_POINTS.warehouses}${editWarehouse.id}/`;
      const response = await patchProtected(url, payload);
      
      if (response) {
        onClose(null);
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

  if (!editWarehouse) return null;
  return (
    <Modal show={true} onHide={() => onClose(null)} size="lg">
      <div className="modal-header">
        <h2>{t("warehouse.updateTitle")}</h2>
        <button className="close-button" onClick={() => onClose(null)}>
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleUpdateWarehouse}>
        <Modal.Body>
          <InputField
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            label={t("warehouse.nameLabel")}
            placeholder={t("warehouse.namePlaceholder")}
          />
          <InputField
            name="capacity"
            value={values.capacity}
            onChange={handleChange}
            required
            type="number"
            label={t("warehouse.capacityLabel")}
            placeholder={t("warehouse.capacityPlaceholder")}
          />
          {/* <InputField
            name="location"
            value={values.location || ''}
            onChange={handleChange}
            label={t("warehouse.locationLabel")}
            placeholder={t("warehouse.locationPlaceholder")}
          /> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="close" onClick={() => onClose(null)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">
            {t("assetUpdate.buttons.save")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UpdateWarehouse; 
   