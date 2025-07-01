import React, { useState } from "react";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { postProtected } from "../../network/ApiService";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import InputField from "../../SharedComponent/Fields/InputField";
import Button from "../../SharedComponent/Button/Button";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import Loading from "../../SharedComponent/Loading";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const initialAssests = {
  depreciation: "",
  maintenance_costs: "",
  operating_costs: "",
  insurance_costs: "",
  notes: "",
  date: "",
};

const CreateFinanceAssetPage = (props) => {
  const navigate = useNavigate() ; 
  const { show, onClose } = props;
  const { t } = useTranslation();
  const [newAsset, setNewAsset] = useState({ ...initialAssests });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((pre) => ({ ...pre, [name]: value }));
  };

  const handleCreateAsset = async () => {
    console.log("Create Asset button clicked" , loading);
    if (loading) return; // Prevent multiple submissions if already loading
    
    try {
      console.log("inside tryu")
      setLoading(true);
      const payload = { ...newAsset };
      const url = API_END_POINTS.financeReport;
      console.log(url)
      const response = await postProtected(url, payload);
      console.log("response = " , response) ; 
      if (response) {
        setNewAsset({ ...initialAssests });
        onClose(false);
        toast.success('Asset created successfully!'); // Notify user of success
      }
    } catch (e) {
      console.log("error = " , e ) ; 
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    } finally {
      setLoading(false); // Ensure loading is turned off
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4  bg-white">
    <h2 className="create-asset-title text-xl md:text-2xl font-semibold mb-6">{t('finance.create.title')}</h2>
    <form onSubmit={(e) => {e.preventDefault() ; handleCreateAsset()  }} className="w-full">
      <div className="modal-body grid gap-4 mb-6">
        <InputField
          type="date"
          name="date"
          value={newAsset.date}
          onChange={handleChange}
          required
          label={t('finance.create.fields.date')}
          
          // placeholder={t('finance.create.fields.enterDate')}
          placeholder={'Enter Date'}
          className="w-full"
        />
        <InputField
          type="text"
          name="depreciation"
          value={newAsset.depreciation}
          onChange={handleChange}
          required
          label={t('finance.create.fields.depreciation')}
          // placeholder={t('finance.create.fields.enterDepreciation')}
          placeholder='Enter Description'

          className="w-full"
        />
        <InputField
          type="number"
          name="insurance_costs"
          value={newAsset.insurance_costs}
          onChange={handleChange}
          required
          label={t('finance.create.fields.insuranceCosts')}
          // placeholder={t('finance.create.fields.enterInsuranceCosts')}
          placeholder="Enter Insurance cost"
          className="w-full"
        />
        <InputField
          type="number"
          name="maintenance_costs"
          value={newAsset.maintenance_costs}
          onChange={handleChange}
          required
          label={t('finance.create.fields.maintenanceCosts')}
          // placeholder={t('finance.create.fields.enterMaintenanceCosts')}
          placeholder="Enter Maintainance Cost"
          className="w-full"
        />
        <InputField
          type="number"
          name="operating_costs"
          value={newAsset.operating_costs}
          onChange={handleChange}
          required
          label={t('finance.create.fields.operatingCosts')}
          // placeholder={t('finance.create.fields.enterOperatingCosts')}
          placeholder='Enter Operating Cost'
          className="w-full"
        />
        <TextareaField
          name="notes"
          value={newAsset.notes}
          onChange={handleChange}
          required
          label={t('finance.create.fields.notes')}
          // placeholder={t('finance.create.fields.enterNotes')}
          placeholder='Enter Notes'
          className="w-full"
        />
      </div>
      <div className="modal-footer flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button 
          variant="close" 
          onClick={() =>{navigate('/dashboard')}}
          className="w-full sm:w-auto order-3 sm:order-1 bg-gray-200 px-3 py-2"
        >
          {t('finance.create.buttons.cancel')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 order-1 sm:order-2 px-3 py-2"
        >
          {t('finance.create.buttons.create')}
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 order-2 sm:order-3 px-3 py-2"
        >
          {t('common.buttons.addRecord')}
        </button>
      </div>
    </form>
  </div>
  );
};

export default CreateFinanceAssetPage;