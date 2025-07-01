import React, { useState } from "react";
import { toast } from "react-toastify";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { postProtected } from "../../network/ApiService";
import { FaTimes } from "react-icons/fa";
import InputField from "../../SharedComponent/Fields/InputField";
import Button from "../../SharedComponent/Button/Button";
import { useTranslation } from "react-i18next";
import SelectField from "../../SharedComponent/Fields/SelectField";


const initailValue = {
  asset: "",
  customer: "",
  offer_details: "",
  price: "",
  terms: "",
  status: "",
};

const CreateOfferPage = (props) => {
  const { show, onClose } = props;
  const { t } = useTranslation();

  const initialValues = props.existingData ? {} : { ...initailValue };

  const [values, setValues] = useState(initialValues);
  const [loader, setLoader] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((pre) => ({ ...pre, [name]: value }));
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const response = await postProtected(API_END_POINTS.createOffer, {
        asset: values.asset,
        customer: values.customer,
        offer_details: values.offer_details,
        price: values.price,
        terms: values.terms,
        status: values.status,
      });
      if (response) {
        toast.success("Offer created successfully!");
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create offer. Please check your input.");
    } finally {
      setLoader(false);
    }
  };

//   if (!show) return null;
  return (
    <div className="create-offer-page">
      <h2 className="create-offer-title">{t('offers.create.title')}</h2>
        <form onSubmit={handleCreateOffer}>
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
              onChange={(e) => setValues({ ...values, status: e.target.value })}
              label={t('offers.create.fields.status')}
              placeholder="Select Status"
              menus={[
                { value: "", option: "Select Status" },
                { value: "Pending", option: "Pending" },
                { value: "Accepted", option: "Accepted" },
                { value: "Rejected", option: "Rejected" },
              ]}
            />
          </div>
          <div className="modal-footer">
            <Button variant="close" onClick={onClose}>
              {t('offers.create.buttons.cancel')}
            </Button>
            <Button type="submit" disabled={loader}>
              {loader ? 'Creating...' : t('offers.create.buttons.create')}
            </Button>
          </div>
        </form>
      </div>
  );
};

export default CreateOfferPage;
