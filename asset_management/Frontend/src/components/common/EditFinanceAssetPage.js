import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes } from "react-icons/fa";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import Button from "../../SharedComponent/Button/Button";
import { patchProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { toast } from "react-toastify";
import Loading from "../../SharedComponent/Loading";

const EditFinanceAssetPage = (props) => {
  const { show, onClose, asset } = props;
  const { t } = useTranslation();
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((pre) => ({ ...pre, [name]: value }));
  };

  useEffect(() => {
    setValues({ ...show });
  }, [show]);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {...values};

      const url = `${API_END_POINTS.financeReport}${asset.id}/${values.id}/`;
      const response = await patchProtected(url, payload);
      if (response) {
        setValues({});
        onClose(false);
        setLoading(false);
        toast.success(t('finance.update.success'));
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        toast.error(t('finance.update.error'));
      }
    } finally {
      setLoading(false);
    }
  };

//   if (!show) return null;
  return (
    <div className="create-asset-page">
      <h2 className="create-finance-title">{t('finance.update.title')}</h2> 
          <button 
            className="close-button" 
            onClick={() => onClose(false)}
            aria-label={t('common.close')}
          >
            <FaTimes />
          </button>
        <Loading loading={loading} />
        <form onSubmit={handleCreateAsset}>
          <div className="modal-body">
            <InputField
              type="date"
              name="date"
              value={values.date}
              onChange={handleChange}
              required
              label={t('finance.create.fields.date')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.date')}`}
            />
            <InputField
              type="number"
              name="depreciation"
              value={values.depreciation}
              onChange={handleChange}
              required
              label={t('finance.create.fields.depreciation')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.depreciation')}`}
            />
            <InputField
              type="number"
              name="insurance_costs"
              value={values.insurance_costs}
              onChange={handleChange}
              required
              label={t('finance.create.fields.insuranceCosts')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.insuranceCosts')}`}
            />
            <InputField
              type="number"
              name="maintenance_costs"
              value={values.maintenance_costs}
              onChange={handleChange}
              required
              label={t('finance.create.fields.maintenanceCosts')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.maintenanceCosts')}`}
            />
            <InputField
              type="number"
              name="operating_costs"
              value={values.operating_costs}
              onChange={handleChange}
              required
              label={t('finance.create.fields.operatingCosts')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.operatingCosts')}`}
            />
            <TextareaField
              name="notes"
              value={values.notes}
              onChange={handleChange}
              required
              label={t('finance.create.fields.notes')}
              placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.notes')}`}
            />
          </div>
          <div className="modal-footer">
            <Button variant="close" onClick={() => onClose(false)}>
              {t('finance.create.buttons.cancel')}
            </Button>
            <Button type="submit">
              {t('finance.update.buttons.update')}
            </Button>
          </div>
        </form>
    </div>
  );
};

export default EditFinanceAssetPage;
