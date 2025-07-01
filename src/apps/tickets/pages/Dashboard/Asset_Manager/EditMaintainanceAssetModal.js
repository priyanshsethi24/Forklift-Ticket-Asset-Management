import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { toast } from "react-toastify";
import { patchProtected } from "../../../../../network/ApiService";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import Button from "../../../../../SharedComponent/Button/Button";
import InputField from "../../../../../SharedComponent/Fields/InputField";
import Loading from "../../../../../SharedComponent/Loading";
import { FaTimes } from "react-icons/fa";

const EditMaintainanceAssetModal = (props) => {
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

  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { ...values };

      const url = `${API_END_POINTS.assets}${asset.id}/maintenance/${values.id}/`;
      const response = await patchProtected(url, payload);
      if (response) {
        setValues({});
        onClose(false);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t('maintenance.edit.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t('maintenance.edit.title')}</h2>
          <button 
            className="close-button" 
            onClick={() => onClose(false)}
            aria-label={t('common.close')}
          >
            <FaTimes />
          </button>
        </div>
        <Loading loading={loading} />
        <form onSubmit={handleUpdateMaintenance}>
          <div className="modal-body">
            <InputField
              type="date"
              name="date"
              value={values.date}
              onChange={handleChange}
              required
              label={t('maintenance.fields.date')}
              placeholder={t('maintenance.edit.enterDate')}
            />
            <InputField
              name="details"
              value={values.details}
              onChange={handleChange}
              required
              label={t('maintenance.fields.details')}
              placeholder={t('maintenance.edit.enterDetails')}
            />
            <InputField
              type="number"
              name="cost"
              value={values.cost}
              onChange={handleChange}
              required
              label={t('maintenance.fields.cost')}
              placeholder={t('maintenance.edit.enterCost')}
            />
          </div>
          <div className="modal-footer">
            <Button variant="close" onClick={() => onClose(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('maintenance.edit.updateRecord')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaintainanceAssetModal;
