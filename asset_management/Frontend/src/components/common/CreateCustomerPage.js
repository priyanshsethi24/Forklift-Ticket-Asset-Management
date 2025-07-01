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


const initialCustomer = {
  name: "",
  contact_information: "",
  customer_manager: "",
  transaction_history: "",
};

const CreateCustomerPage = ({ show , onSubmit }) => {
  const { t } = useTranslation();
  const [newCustomer, setNewCustomer] = useState({ ...initialCustomer });
  const navigate = useNavigate() ; 
  const onClose = () => {
    navigate('/dashboard'); 
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const url = API_END_POINTS.customers;
      if (!url) {
        throw new Error('API endpoint not defined');
      }

      const response = await postProtected(url, newCustomer);

      if (response) {
        setNewCustomer({ ...initialCustomer });
        toast.success("Customer created successfully!");
        onClose(false);
      }
    } catch (error) {
      console.error('Create customer error:', error);
      const message = error?.response?.data?.messages?.[0]?.message;
      toast.error(message || "Failed to create customer");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white mt-16">
    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold mb-6">{t('customers.create.title')}</h2>
      
      <form onSubmit={handleCreateCustomer} className="space-y-6">
        <InputField
          name="name"
          value={newCustomer.name}
          onChange={handleChange}
          expanplanation={t('customers.create.explanation.enterName')}
          required
          label={t('customers.create.fields.name')}
          placeholder={t('customers.create.fields.name')}
        />
        
        <InputField
          name="contact_information"
          value={newCustomer.contact_information}
          onChange={handleChange}
          expanplanation={t('customers.create.explanation.enterContactInfo')}
          required
          label={t('customers.create.fields.contactInfo')}
          placeholder={t('customers.create.fields.contactInfo')}
        />
        
        <InputField
          name="customer_manager"
          value={newCustomer.customer_manager}
          onChange={handleChange}
          required
          label={t('customers.create.fields.manager')}
          placeholder={t('customers.create.fields.manager')}
        />
        
        <InputField
          name="transaction_history"
          value={newCustomer.transaction_history}
          onChange={handleChange}
          label={t('customers.create.fields.transactionHistory')}
          placeholder={t('customers.create.fields.transactionHistory')}
        />
        
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('customers.create.buttons.cancel')}
          </button>
          
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('customers.create.buttons.create')}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

CreateCustomerPage.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateCustomerPage;
