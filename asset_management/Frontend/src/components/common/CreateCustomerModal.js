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
import { Modal } from "react-bootstrap";

const initialCustomer = {
  name: "",
  contact_information: "",
  customer_manager: "",
  transaction_history: "",
};

const CreateCustomerModal = ({ show, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [newCustomer, setNewCustomer] = useState({ ...initialCustomer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const url = API_END_POINTS.customers;
      if (!url) {
        throw new Error("API endpoint not defined");
      }

      const response = await postProtected(url, newCustomer);

      if (response) {
        setNewCustomer({ ...initialCustomer });
        toast.success("Customer created successfully!");
        // onSubmit(response);
        onClose(false);
      }
    } catch (error) {
      console.error("Create customer error:", error);
      const message = error?.response?.data?.messages?.[0]?.message;
      toast.error(message || "Failed to create customer");
    }
  };

  if (!show) return null;

  return (
    <Modal show={true} onHide={() => onClose(false)} size="lg">
      <div className="modal-header">
        <h2>{t("customers.create.title")}</h2>
        <button className="close-button" onClick={() => onClose(false)}>
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleCreateCustomer}>
        <Modal.Body>
          <InputField
            name="name"
            value={newCustomer.name}
            onChange={handleChange}
            required
            label={t("customers.create.fields.name")}
            placeholder={`${t("customers.create.placeholders.enter")} ${t(
              "customers.create.fields.name"
            )}`}
          />
          <InputField
            name="contact_information"
            value={newCustomer.contact_information}
            onChange={handleChange}
            required
            label={t("customers.create.fields.contactInfo")}
            placeholder={`${t("customers.create.placeholders.enter")} ${t(
              "customers.create.fields.contactInfo"
            )}`}
          />
          {/* <InputField
            name="customer_id"
            value={newCustomer.customer_id}
            onChange={handleChange}
            required
            label={t('customers.create.fields.manager')}
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.manager')}`}
          /> */}
          <InputField
            name="transaction_history"
            value={newCustomer.transaction_history}
            onChange={handleChange}
            label={t("customers.create.fields.transactionHistory")}
            placeholder={`${t("customers.create.placeholders.enter")} ${t(
              "customers.create.fields.transactionHistory"
            )}`}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="close" onClick={onClose}>
            {t("customers.create.buttons.cancel")}
          </Button>
          <Button type="submit">{t("customers.create.buttons.create")}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

CreateCustomerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateCustomerModal;
