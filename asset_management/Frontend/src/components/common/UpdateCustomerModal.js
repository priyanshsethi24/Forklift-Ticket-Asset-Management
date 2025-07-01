import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import SelectField from "../../SharedComponent/Fields/SelectField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { patchProtected } from "../../network/ApiService";
import { Modal } from "react-bootstrap";

const UpdateCustomerModal = ({ editCustomer, onClose }) => {
  const { t } = useTranslation();
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues({ ...editCustomer });
  }, [editCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    try {
      const payload = {};
      Object.entries(values).forEach(([key, value]) => {
        if (value !== editCustomer[key]) {
          payload[key] = value;
        }
      });

      if (Object.keys(payload).length === 0) {
        return;
      }

      const url = `${API_END_POINTS.customers}${editCustomer.id}/`;
      const response = await patchProtected(url, payload);
      
      if (response) {
        onClose(null);
        toast.success(t('customer.update.success'));
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        toast.error(t('customer.update.error'));
      }
    }
  };

  if (!editCustomer) return null;

  return (
    <Modal show={true} onHide={() => onClose(null)} size="lg">
      <div className="modal-header">
        <h2>{t('customers.update.title')}</h2>
        <button 
          className="close-button" 
          onClick={() => onClose(null)}
          aria-label={t('common.close')}
        >
          <FaTimes />
        </button>
      </div>
      <form onSubmit={handleUpdateCustomer}>
        <Modal.Body>
          <InputField
            name="name"
            value={values.name || ''}
            onChange={handleChange}
            required
            label={t('customers.create.fields.name')}
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.name')}`}
          />
          <InputField
            name="contact_information"
            value={values.contact_information || ''}
            onChange={handleChange}
            required
            label={t('customers.create.fields.contactInfo')}
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.contactInfo')}`}
          />
          <InputField
            name="customer_manager"
            value={values.customer_manager || ''}
            onChange={handleChange}
            required
            label={t('customers.create.fields.manager')}
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.manager')}`}
          />
          <InputField
            name="transaction_history"
            value={values.transaction_history || ''}
            onChange={handleChange}
            required
            label={t('customers.create.fields.transactionHistory')}
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.transactionHistory')}`}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="close" onClick={() => onClose(null)}>
            {t('customers.create.buttons.cancel')}
          </Button>
          <Button type="submit">
            {t('customers.update.buttons.update')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UpdateCustomerModal; 