import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { toast } from "react-toastify";
import { postProtected } from "../../../../../network/ApiService";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import Button from "../../../../../SharedComponent/Button/Button";
import InputField from "../../../../../SharedComponent/Fields/InputField";
import Loading from "../../../../../SharedComponent/Loading";
import { FaTimes } from "react-icons/fa";

const initailMaintainance = {
  data: "",
  details: "",
  cose: "",
};

const CreateAssetMaintainance = (props) => {
  const { show, onClose } = props;
  const { t } = useTranslation();
  const [newMaintainance, setNewMaintainance] = useState({
    ...initailMaintainance,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMaintainance((pre) => ({ ...pre, [name]: value }));
  };

  const handleCreateMaintainance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...newMaintainance,
      };

      const url = API_END_POINTS.maintenance + show.id + "/";
      const response = await postProtected(url, payload);
      if (response) {
        setNewMaintainance({
          ...initailMaintainance,
        });
        onClose(false);
        setLoading(false);
        toast.success("Maintenance record created successfully!");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t('maintenance.create.error'));
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
          <h2>{t('maintenance.create.title')}</h2>
          <button 
            className="close-button" 
            onClick={() => onClose(false)}
            aria-label={t('common.close')}
          >
            <FaTimes />
          </button>
        </div>
        <Loading loading={loading} />
        <form onSubmit={handleCreateMaintainance}>
          <div className="modal-body">
            <InputField
              type="date"
              name="date"
              value={newMaintainance.date}
              onChange={handleChange}
              required
              label={t('maintenance.fields.date')}
              placeholder={t('maintenance.create.enterDate')}
            />
            <InputField
              name="details"
              value={newMaintainance.details}
              onChange={handleChange}
              required
              label={t('maintenance.fields.details')}
              placeholder={t('maintenance.create.enterDetails')}
            />
            <InputField
              type="number"
              name="cost"
              value={newMaintainance.cost}
              onChange={handleChange}
              required
              label={t('maintenance.fields.cost')}
              placeholder={t('maintenance.create.enterCost')}
            />
          </div>
          <div className="modal-footer">
            <Button variant="close" onClick={() => onClose(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('maintenance.create.addRecord')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssetMaintainance;
