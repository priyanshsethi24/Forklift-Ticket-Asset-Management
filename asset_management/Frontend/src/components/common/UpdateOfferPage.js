import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { FaTimes } from "react-icons/fa";
import InputField from "../../SharedComponent/Fields/InputField";
import Button from "../../SharedComponent/Button/Button";
import { toast } from "react-toastify";
import { patchProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";
import SelectField from "../../SharedComponent/Fields/SelectField";

const UpdateOfferPage = (props) => {
  const { editOffer, onClose } = props;
  const { t } = useTranslation();
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues({ ...editOffer });
  }, [editOffer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((pre) => ({ ...pre, [name]: value }));
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();

    try {
      const payload = {};
      Object.entries(values).forEach(([key, value]) => {
        if (value !== editOffer[key]) {
          payload[key] = value;
        }
      });
      if (Object.keys(payload).length === 0) {
        return;
      }
      const url = `${API_END_POINTS.createOffer}${editOffer.id}/`;
      const response = await patchProtected(url, payload);
      if (response) {
        onClose(false);
        toast.success(t('offers.messages.updateSuccess'));
      }
      console.log(response);
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        toast.error(t('offers.messages.updateError'));
      }
    }
  };

//   if (!editOffer) return null;
  return (
    <div className="update-offer-page">
      <h2 className="update-offer-title">{t('offers.update.title')}</h2>
        <form onSubmit={handleUpdateOffer}>
          <div className="modal-body">
            <InputField
              name="asset"
              value={values.asset}
              onChange={handleChange}
              required
              label={t('offers.create.fields.assetId')}
              placeholder={`${t('offers.create.placeholders.enter')} ${t('offers.create.fields.assetId')}`}
            />
            <InputField
              name="customer"
              value={values.customer}
              onChange={handleChange}
              required
              label={t('offers.create.fields.customerId')}
              placeholder={`${t('offers.create.placeholders.enter')} ${t('offers.create.fields.customerId')}`}
            />
            <InputField
              name="offer_details"
              value={values.offer_details}
              onChange={handleChange}
              required
              label={t('offers.create.fields.details')}
              placeholder={`${t('offers.create.placeholders.enter')} ${t('offers.create.fields.details')}`}
            />
            <InputField
              name="price"
              value={values.price}
              onChange={handleChange}
              required
              label={t('offers.create.fields.price')}
              placeholder={`${t('offers.create.placeholders.enter')} ${t('offers.create.fields.price')}`}
            />
            <InputField
              name="terms"
              value={values.terms}
              onChange={handleChange}
              required
              label={t('offers.create.fields.terms')}
              placeholder={`${t('offers.create.placeholders.enter')} ${t('offers.create.fields.terms')}`}
            />
            <SelectField
              name="status"
              value={values.status}
              onChange={handleChange}
              required
              label={t('offers.create.fields.status')}
              menus={[
                { value: "", option: t('offers.create.fields.status') },
                { value: "Pending", option: t('offers.status.pending') },
                { value: "Accepted", option: t('offers.status.accepted') },
                { value: "Rejected", option: t('offers.status.rejected') },
              ]}
            />
          </div>
          <div className="modal-footer">
            <Button variant="close" onClick={() => onClose(null)}>
              {t('offers.create.buttons.cancel')}
            </Button>
            <Button type="submit">
              {t('offers.actions.edit')}
            </Button>
          </div>
        </form>
    </div>
  );
};

export default UpdateOfferPage;
