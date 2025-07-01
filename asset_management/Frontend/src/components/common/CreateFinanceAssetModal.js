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
import { Modal } from "react-bootstrap";

const initialAssests = {
  depreciation: "",
  maintenance_costs: "",
  operating_costs: "",
  insurance_costs: "",
  notes: "",
  date: "",
};

const CreateFinanceAssetModal = (props) => {
  const { show, onClose } = props;
  const { t } = useTranslation();
  const [newAsset, setNewAsset] = useState({ ...initialAssests });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAsset((pre) => ({ ...pre, [name]: value }));
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...newAsset
      };

      const url = API_END_POINTS.financeReport + show.id + "/";
      const response = await postProtected(url, payload);
      // Add new asset to the list
      if (response) {
        setNewAsset({
          ...initialAssests,
        });
        onClose(false);
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show={true} onHide={() => onClose(false)} size="lg">
      <div className="modal-header">
        <h2>{t('finance.create.title')}</h2>
        <button className="close-button" onClick={() => onClose(false)}>
          <FaTimes />
        </button>
      </div>
      <Loading loading={loading} />
      <form onSubmit={handleCreateAsset}>
        <Modal.Body>
          <InputField
            type="date"
            name="date"
            value={newAsset.date}
            onChange={handleChange}
            required
            label={t('finance.create.fields.date')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.date')}`}
          />
          <InputField
            type="number"
            name="depreciation"
            value={newAsset.depreciation}
            onChange={handleChange}
            required
            label={t('finance.create.fields.depreciation')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.depreciation')}`}
          />
          <InputField
            type="number"
            name="insurance_costs"
            value={newAsset.insurance_costs}
            onChange={handleChange}
            required
            label={t('finance.create.fields.insuranceCosts')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.insuranceCosts')}`}
          />
          <InputField
            type="number"
            name="maintenance_costs"
            value={newAsset.maintenance_costs}
            onChange={handleChange}
            required
            label={t('finance.create.fields.maintenanceCosts')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.maintenanceCosts')}`}
          />
          <InputField
            type="number"
            name="operating_costs"
            value={newAsset.operating_costs}
            onChange={handleChange}
            required
            label={t('finance.create.fields.operatingCosts')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.operatingCosts')}`}
          />
          <TextareaField
            name="notes"
            value={newAsset.notes}
            onChange={handleChange}
            required
            label={t('finance.create.fields.notes')}
            placeholder={`${t('finance.create.placeholders.enter')} ${t('finance.create.fields.notes')}`}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="close" onClick={() => onClose(false)}>
            {t('finance.create.buttons.cancel')}
          </Button>
          <Button type="submit">
            {t('finance.create.buttons.create')}
          </Button>
          <Button type="submit">
            {t('common.buttons.addRecord')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateFinanceAssetModal;
