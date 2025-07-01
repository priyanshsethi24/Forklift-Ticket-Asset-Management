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
import { useNavigate } from "react-router-dom";

const UpdateCustomerPage = ({ editCustomer  }) => {
  const navigate = useNavigate()  ; 
  const { t } = useTranslation();
  const [values, setValues] = useState({});
  const onClose = () => {
    navigate('/dashboard') ;
  }

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
        onClose(); 
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

//   if (!editCustomer) return null;

  return (
   <div className="flex items-center justify-center min-h-screen bg-white p-2 sm:p-4 my-16 ">
  <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm">
    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center">{t('customers.update.title')}</h2>
    
    <form onSubmit={handleUpdateCustomer} className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-xs sm:text-sm font-medium mb-1">
            {t('customers.create.fields.name')}*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name || ''}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.name')}`}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="contact_information" className="text-xs sm:text-sm font-medium mb-1">
            {t('customers.create.fields.contactInfo')}*
          </label>
          <input
            id="contact_information"
            name="contact_information"
            type="text"
            value={values.contact_information || ''}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.contactInfo')}`}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="customer_manager" className="text-xs sm:text-sm font-medium mb-1">
            {t('customers.create.fields.manager')}*
          </label>
          <input
            id="customer_manager"
            name="customer_manager"
            type="text"
            value={values.customer_manager || ''}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.manager')}`}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="transaction_history" className="text-xs sm:text-sm font-medium mb-1">
            {t('customers.create.fields.transactionHistory')}*
          </label>
          <input
            id="transaction_history"
            name="transaction_history"
            type="text"
            value={values.transaction_history || ''}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`${t('customers.create.placeholders.enter')} ${t('customers.create.fields.transactionHistory')}`}
          />
        </div>
      </div>

      <div className="flex flex-col xs:flex-row justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onClose(null)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors w-full xs:w-auto"
        >
          {t('customers.create.buttons.cancel')}
        </button>
        <button
          type="submit"
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors w-full xs:w-auto mt-2 xs:mt-0"
        >
          {t('customers.update.buttons.update')}
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

export default UpdateCustomerPage; 