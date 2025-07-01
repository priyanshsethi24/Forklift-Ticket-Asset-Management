import React, { useEffect, useState, useRef } from "react";
import { FaTimes, FaUpload, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaDownload } from "react-icons/fa";
import { getProtected, patchProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import SelectField from "../../SharedComponent/Fields/SelectField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import { useTranslation } from 'react-i18next';
import { Modal } from "react-bootstrap";

const AssetUpdateModal = (props) => {
  const {
    selectedAsset,
    setSelectedAsset,
    setShowEditModal,
    showEditModal,
    setAssets
  } = props;
  const { t } = useTranslation();
  const [editingAsset, setEditingAsset] = useState({});
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    if (selectedAsset && showEditModal) {
      console.log('Received selectedAsset:', selectedAsset);
      setEditingAsset(selectedAsset);
    }
  }, [selectedAsset, showEditModal]);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowEditModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        const validFileTypes = {
          'image/jpeg': 'image',
          'image/png': 'image',
          'image/gif': 'image',
          'application/pdf': 'document',
          'application/msword': 'document',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
          'application/vnd.ms-excel': 'document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document'
        };

        const validFiles = fileArray.filter((file) => {
          if (!validFileTypes[file.type]) {
            toast.error(
              `File ${file.name} is not a valid type. Allowed types: Images (JPEG, PNG, GIF) and Documents (PDF, DOC, DOCX, XLS, XLSX)`
            );
            return false;
          }

          if (file.size > maxFileSize) {
            toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
            return false;
          }

          return true;
        });

        if (validFiles.length > 0) {
          const filesWithType = validFiles.map(file => ({
            file,
            type: validFileTypes[file.type],
            preview: validFileTypes[file.type] === 'image' ? URL.createObjectURL(file) : null,
            name: file.name
          }));
          
          setAttachments(prev => [...prev, ...filesWithType]);
          setShowAttachments(true);
        }
      }
    } else {
      if (type === 'number') {
        // Prevent negative values
        const numValue = parseFloat(value);
        if (numValue < 0) return;
      }
      setEditingAsset(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {};
      // Compare editingAsset with selectedAsset to find changes
      Object.entries(editingAsset).forEach(([key, value]) => {
        if (value !== selectedAsset[key]) {
          payload[key] = value;
        }
      });

      // If no changes, return early
      if (Object.keys(payload).length === 0) {
        return;
      }

      // Use selectedAsset.id to construct the URL
      const url = `${API_END_POINTS.assets}${selectedAsset.id}`;
      const response = await patchProtected(url, payload);
      
      if (response) {
        setShowEditModal(false);
        setAssets(prevAssets =>
          prevAssets.map(asset =>
            asset.id === selectedAsset.id ? { ...asset, ...response } : asset
          )
        );
        toast.success(t('assetUpdate.messages.updateSuccess'));
      }
      console.log('Update response:', response);
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      } else {
        toast.error(t('assetUpdate.messages.updateError'));
      }
    }
  };

  const getWarehouse = async () => {
    try {
      const url = API_END_POINTS.warehouses;
      const response = await getProtected(url);
      if (response) {
        setWarehouse(response);
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    }
  };

  useEffect(() => {
    getWarehouse();
  }, []);

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      if (newAttachments.length === 0) {
        setShowAttachments(false);
      }
      return newAttachments;
    });
  };

  if (!showEditModal || !selectedAsset) return null;

  return (
    showEditModal &&
    selectedAsset && (
      <div className="modal-backdrop">
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" >
          <div className="modal-header">
            <h3>{t('assets.create.fields.titles')}</h3>
            <button
              className="close-button"
              onClick={() => setShowEditModal(false)}
              aria-label={t('assetUpdate.buttons.close')}
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleUpdateAsset}>
            <Modal.Body>
              <InputField
                name="brand"
                value={editingAsset.brand}
                onChange={handleChange}
                label={t('assetUpdate.fields.brand')}
                placeholder={t('assetUpdate.fields.enterBrand')}
              />
              <InputField
                name="model"
                value={editingAsset.model}
                onChange={handleChange}
                label={t('assetUpdate.fields.model')}
                placeholder={t('assetUpdate.fields.enterModel')}
              />
              <TextareaField
                name="description"
                value={editingAsset.description}
                onChange={handleChange}
                label={t('assetUpdate.fields.description')}
                placeholder={t('assetUpdate.fields.enterDescription')}
              />
              <InputField
                type="date"
                name="purchase_date"
                value={editingAsset.purchase_date}
                onChange={handleChange}
                label={t('assetUpdate.fields.purchaseDate')}
                placeholder={t('assetUpdate.fields.enterPurchaseDate')}
              />
              <SelectField
                name="warehouse"
                value={editingAsset.warehouse}
                onChange={handleChange}
                label={t('assetUpdate.fields.warehouse')}
                menus={[
                  { value: "", option: t('assetUpdate.fields.selectWarehouse') },
                  ...warehouse.map((item) => ({
                    value: item.id,
                    option: item.name,
                  })),
                ]}
              />
              <InputField
                type="number"
                name="year_of_manufacture"
                value={editingAsset.year_of_manufacture}
                onChange={handleChange}
                min="0"
                max={new Date().getFullYear()}
                label={t('assetUpdate.fields.yearOfManufacture')}
                placeholder={t('assetUpdate.fields.enterYearOfManufacture')}
              />
              <InputField
                type="number"
                name="battery"
                value={editingAsset.battery}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.battery')}
                placeholder={t('assetUpdate.fields.enterBattery')}
              />
              <InputField
                type="date"
                name="battery_charge_due_date"
                value={editingAsset.battery_charge_due_date}
                onChange={handleChange}
                label={t('assetUpdate.fields.batteryChargeDate')}
                placeholder={t('assetUpdate.fields.enterBatteryChargeDate')}
              />
              <InputField
                type="number"
                name="capacity"
                value={editingAsset.capacity}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.capacity')}
                placeholder={t('assetUpdate.fields.enterCapacity')}
              />
              <InputField
                type="number"
                name="operating_hours"
                value={editingAsset.operating_hours}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.operatingHours')}
                placeholder={t('assetUpdate.fields.enterOperatingHours')}
              />
              <InputField
                type="date"
                name="warranty_expiration_date"
                value={editingAsset.warranty_expiration_date}
                onChange={handleChange}
                label={t('assetUpdate.fields.warrantyExpiration')}
                placeholder={t('assetUpdate.fields.enterWarrantyExpiration')}
              />
              <SelectField
                name="fuel_type"
                value={editingAsset.fuel_type}
                onChange={handleChange}
                label={t('assetUpdate.fields.fuelType')}
                menus={[
                  { value: "", option: t('assetUpdate.fields.selectFuelType') },
                  { value: "Diesel", option: t('assetUpdate.fields.fuelTypeOptions.diesel') },
                  { value: "Electric", option: t('assetUpdate.fields.fuelTypeOptions.electric') },
                  { value: "Hybrid", option: t('assetUpdate.fields.fuelTypeOptions.hybrid') },
                ]}
              />

              <InputField
                name="notes"
                value={editingAsset.notes}
                onChange={handleChange}
                label={t('assetUpdate.fields.notes')}
                placeholder={t('assetUpdate.fields.enterNotes')}
              />
              <TextareaField
                name="battery_description"
                value={editingAsset.battery_description}
                onChange={handleChange}
                label={t('assetUpdate.fields.batteryDescription')}
                placeholder={t('assetUpdate.fields.enterBatteryDescription')}
              />
              <InputField
                type="number"
                name="fuel_consumption"
                value={editingAsset.fuel_consumption}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.fuelConsumption')}
                placeholder={t('assetUpdate.fields.enterFuelConsumption')}
              />
              <InputField
                name="lease_company"
                value={editingAsset.lease_company}
                onChange={handleChange}
                label={t('assetUpdate.fields.leaseCompany')}
                placeholder={t('assetUpdate.fields.enterLeaseCompany')}
              />
              <InputField
                type="number"
                name="machine_category"
                value={editingAsset.machine_category}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.machineCategory')}
                placeholder={t('assetUpdate.fields.enterMachineCategory')}
              />
              <InputField
                type="number"
                name="maintenance_costs"
                value={editingAsset.maintenance_costs}
                onChange={handleChange}
                min="0"
                label={t('assetUpdate.fields.maintenanceCosts')}
                placeholder={t('assetUpdate.fields.enterMaintenanceCosts')}
              />
              <InputField
                name="operational_status"
                value={editingAsset.operational_status}
                onChange={handleChange}
                label={t('assetUpdate.fields.operationalStatus')}
                placeholder={t('assetUpdate.fields.enterOperationalStatus')}
              />

                <InputField
                  type="number"
                  name="purchase_price"
                  value={editingAsset.purchase_price}
                  onChange={handleChange}
                  min="0"
                  label={t('assetUpdate.fields.purchasePrice')}
                  placeholder={t('assetUpdate.fields.enterPurchasePrice')}
                />
                <InputField
                  type="number"
                  name="residual_value"
                  value={editingAsset.residual_value}
                  onChange={handleChange}
                  min="0"
                  label={t('assetUpdate.fields.residualValue')}
                  placeholder={t('assetUpdate.fields.enterResidualValue')}
                />
                <InputField
                  name="serial_number"
                  value={editingAsset.serial_number}
                  onChange={handleChange}
                  label={t('assetUpdate.fields.serialNumber')}
                  placeholder={t('assetUpdate.fields.enterSerialNumber')}
                />
                <SelectField
                  name="status"
                  value={editingAsset.status}
                  onChange={handleChange}
                  label={t('assets.create.fields.status')}
                  placeholder={`${t("assets.create.placeholders.enter")} ${t(
                    "assets.create.fields.status"
                  )}`}
                  menus={[
                    { value: "", option: t('assets.create.placeholders.select') },
                    { value: "New", option: t('assets.create.status.new') },
                    { value: "Used", option: t('assets.create.status.used') },
                    { value: "Miete", option: t('assets.create.status.hire') },
                  ]}
                />
                <InputField
                  type="number"
                  name="total_operating_costs"
                  value={editingAsset.total_operating_costs}
                  onChange={handleChange}
                  min="0"
                  label={t('assetUpdate.fields.totalOperatingCosts')}
                  placeholder={t('assetUpdate.fields.enterTotalOperatingCosts')}
                />
                <InputField
                  type="date"
                  name="uvv_due_date"
                  value={editingAsset.uvv_due_date}
                  onChange={handleChange}
                  label={t('assetUpdate.fields.uvvDueDate')}
                  placeholder={t('assetUpdate.fields.enterUvvDueDate')}
                />
                <InputField
                  name="mast"
                  value={editingAsset.mast}
                  onChange={handleChange}
                  label={t("assets.create.fields.mast")}
                  placeholder={t("assets.create.fields.enterMast")}
                />
                <InputField
                  name="battery"
                  value={editingAsset.battery}
                  onChange={handleChange}
                  label={t("assets.create.fields.battery")}
                  placeholder={t("assets.create.fields.enterBattery")}
                />
                <InputField
                  name="warranty"
                  value={editingAsset.warranty}
                  onChange={handleChange}
                  label={t("assets.create.fields.warranty")}
                  placeholder={t("assets.create.fields.enterWarranty")}
                />
                <div className="form-group">
                  <label>{t("assets.create.fields.attachments")}</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleChange}
                    multiple
                    accept="image/jpeg,image/png,image/gif,application/pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <small className="text-muted">
                    {t("assets.create.fileUpload.supportedFormats")}
                  </small>

                  {showAttachments && attachments.length > 0 && (
                    <div className="selected-files mt-2">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="file-item d-flex align-items-center p-2 border rounded mb-2">
                          {attachment.type === 'image' ? (
                            <div className="file-preview me-2">
                              <img
                                src={attachment.preview}
                                alt={t("assets.create.fileUpload.preview.imageAlt")}
                                style={{ height: '40px', width: '40px', objectFit: 'cover' }}
                              />
                            </div>
                          ) : (
                            <div className="file-icon me-2">
                              {attachment.file.type === 'application/pdf' ? (
                                <FaFilePdf size={24} className="text-danger" />
                              ) : attachment.file.type.includes('spreadsheet') || attachment.file.type.includes('excel') ? (
                                <FaFileExcel size={24} className="text-success" />
                              ) : attachment.file.type.includes('word') ? (
                                <FaFileWord size={24} className="text-primary" />
                              ) : (
                                <FaFile size={24} className="text-secondary" />
                              )}
                            </div>
                          )}
                          <span className="file-name flex-grow-1">{attachment.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', padding: '0' }}
                            aria-label={t("assets.create.fileUpload.removeFile")}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  {t('assetUpdate.buttons.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  {t('assetUpdate.buttons.save')}
                </button>
              </Modal.Footer>
            </form>
        </Modal>
      </div>
    )
  );
};

export default AssetUpdateModal;
