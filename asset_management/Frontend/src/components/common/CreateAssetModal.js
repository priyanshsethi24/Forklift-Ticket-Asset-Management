import PropTypes from "prop-types";
import { FaTimes, FaUpload, FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaDownload } from "react-icons/fa";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import SelectField from "../../SharedComponent/Fields/SelectField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { getProtected, postProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import axios from "axios";

const initialAssests = {
  description: "",
  brand: "",
  model: "",
  machine_category: 0,
  warehouse: 0,
  year_of_manufacture: 0,
  lift_height: 0,
  capacity: 0,
  mast: "",
  closed_height: 0,
  purchase_date: "", 
  purchase_price: 0,
  battery: "",
  battery_description: "0",
  battery_charge_due_date: "",
  locations: [1],
  status: "",
  condition: "New",
  operating_hours: 0,
  maintenance_schedule: "",
  maintenance_costs: 0,
  warranty: "",
  warranty_expiration_date: "",
  operational_status: "",
  fuel_type: 0,
  fuel_consumption: 0,
  uvv_due_date: "",
  notes: "",
  depreciation_method: 1,
  useful_life: 0,
  residual_value: 0,
  lease_company: "",
  annual_depreciation_cost: 0,
  total_operating_costs: 0,
  serial_number: "",
  documents: [],
};

const getFileInfo = (url) => {
  const extension = url.split('.').pop().toLowerCase();
  const fileTypes = {
    'pdf': {
      type: 'application/pdf',
      icon: <FaFilePdf size={20} className="text-danger" />
    },
    'xlsx': {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      icon: <FaFileExcel size={20} className="text-success" />
    },
    'xls': {
      type: 'application/vnd.ms-excel',
      icon: <FaFileExcel size={20} className="text-success" />
    },
    'doc': {
      type: 'application/msword',
      icon: <FaFileWord size={20} className="text-primary" />
    },
    'docx': {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      icon: <FaFileWord size={20} className="text-primary" />
    }
  };
  return fileTypes[extension] || { type: 'application/octet-stream', icon: <FaFile size={20} /> };
};

const handleDownload = async (url, filename) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const fileInfo = getFileInfo(url);
    const blobWithType = new Blob([blob], { type: fileInfo.type });
    
    const downloadUrl = window.URL.createObjectURL(blobWithType);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download file');
  }
};

const AttachmentLink = ({ url, children }) => {
  const filename = url.split('/').pop();
  const fileInfo = getFileInfo(url);
  const [clickTimeout, setClickTimeout] = useState(null);

  const handleClick = (e) => {
    e.preventDefault();

    if (clickTimeout === null) {
      setClickTimeout(
        setTimeout(() => {
          window.open(url, '_blank');
          setClickTimeout(null);
        }, 300)
      );
    } else {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDownload(url, filename);
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  return (
    <div 
      className="attachment-item d-flex align-items-center p-2 border rounded mb-2"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      title={`Click to view, double click to download ${filename}`}
    >
      <div className="file-icon me-2">
        {fileInfo.icon}
      </div>
      <span className="file-name flex-grow-1">{filename}</span>
      <small className="text-muted me-2">
        <em>Click to view, double click to download</em>
      </small>
    </div>
  );
};

const CreateAssetModal = ({ show, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [newAsset, setNewAsset] = useState({ ...initialAssests });
  const [warehouse, setWarehouse] = useState([]);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [documents, setDocuments] = useState([]);
  const modalRef = useRef(null);

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
      setNewAsset((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'status' ? { condition: value } : {})
      }));
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Revoke object URL if it exists to prevent memory leaks
      if (newAttachments[index].preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      
      // Hide attachments section if no files left
      if (newAttachments.length === 0) {
        setShowAttachments(false);
      }
      
      return newAttachments;
    });
  };

  const removeDocument = (index) => {
    setDocuments((prevDocs) => prevDocs.filter((_, i) => i !== index));
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();

    // Validate mandatory fields
    const mandatoryFields = [
        { key: 'brand', label: t("assets.create.fields.brand") },
        { key: 'model', label: t("assets.create.fields.model") },
        { key: 'description', label: t("assets.create.fields.description") },
        { key: 'purchase_date', label: t("assets.create.fields.purchaseDate") },
        { key: 'warehouse', label: t("assets.create.fields.warehouse") },
        { key: 'status', label: t("assets.create.fields.status") },
        { key: 'battery_charge_due_date', label: t("assets.create.fields.batteryChargeDate") },
        { key: 'warranty_expiration_date', label: t("assets.create.fields.warrantyExpiration") },
        { key: 'fuel_type', label: t("assets.create.fields.fuelType")},
        { key: 'notes', label: t("assets.create.fields.notes") },
        { key: 'serial_number', label: t("assets.create.fields.serialNumber") },
        {key: 'mast', label: t("assets.create.fields.mast")},
        {key: 'operational_status', label: t("assets.create.fields.operationalStatus")},
        {key: 'battery', label: t("assets.create.fields.battery")},
    ];

    const emptyFields = mandatoryFields.filter(field => !newAsset[field.key]);

    if (emptyFields.length > 0) {
        emptyFields.forEach(field => {
            toast.error(t("common.errors.mandatoryField", { field: field.label }));
        });
        return; 
    }

    const today = new Date().toISOString().split('T')[0]; 
    if (newAsset.warranty_expiration_date < today) {
        toast.error(t("createAsset.errors.warrantyExpirationFuture"));
        return;
    }
    if (newAsset.uvv_due_date < today) {
        toast.error(t("createAsset.errors.uvvDueDateFuture"));
        return;
    }
    if (newAsset.battery_charge_due_date < today) {
      toast.error(t("createAsset.errors.batteryChargeDueDateFuture"));
      return;
  }


    try {
      const formData = new FormData();

      // Add all asset data to formData
      Object.entries(newAsset).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'attachments') {
          formData.append(key, value.toString());
        }
      });

      // Add attachments
      attachments.forEach(({ file }) => {
        formData.append('attachments', file);
      });

      const response = await postProtected(
        API_END_POINTS.createAssets,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response) {
        setNewAsset({ ...initialAssests });
        setAttachments([]);
        setDocuments([]);
        setShowMediaUpload(false);
        onClose(false);
        toast.success(t("assets.create.fields.success"));
      }
    } catch (e) {
      console.error("Error creating asset:", e);
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.attachments?.[0]?.non_field_errors?.[0] ||
        e?.response?.data?.messages?.[0]?.message;
      toast.error(message || t("assets.create.fields.error"));
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

  const handleUploadComplete = (event) => {
    // Handle upload complete event
  };

  const clearForm = () => {
    setNewAsset(initialAssests);
    setAttachments([]);
    setDocuments([]);
    setShowMediaUpload(false);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, []);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose(); // Close the modal if clicked outside
    }
  };

  if (!show) return null;
  return (
    <Modal show={show} onHide={onClose} size="lg" ref={modalRef}>
       <div className="modal-header">
          <h3>{t('assets.create.title')}</h3>
          <button className="close-button" onClick={() => onClose(false)}>
            <FaTimes />
          </button>
        </div>
      <form onSubmit={handleCreateAsset}>
        <Modal.Body>
          <InputField
            name="brand"
            value={newAsset.brand}
            onChange={handleChange}
            required
            label={t("assets.create.fields.brand")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.brand"
            )}`}
          />
          <InputField
            name="model"
            value={newAsset.model}
            onChange={handleChange}
            required
            label={t("assets.create.fields.model")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.model"
            )}`}
          />
          <InputField
            name="description"
            value={newAsset.description}
            onChange={handleChange}
            required
            label={t("assets.create.fields.description")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.description"
            )}`}
          />
          <InputField
            type="date"
            name="purchase_date"
            value={newAsset.purchase_date}
            onChange={(e) => {
                const dateValue = e.target.value;
                setNewAsset({ ...newAsset, purchase_date: dateValue });
            }}
            required
            label={t("assets.create.fields.purchaseDate")}
              placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.purchaseDate"
            )}`}
          />
          <SelectField
            name="warehouse"
            value={newAsset.warehouse}
            onChange={handleChange}
            required
            label={t("assets.create.fields.warehouse")}
            menus={[
              { value: "", option: t("assets.create.placeholders.select") },
              ...warehouse.map((item) => ({
                value: item.id,
                option: item.name,
              })),
            ]}
          />
          <InputField
            type="number"
            name="year_of_manufacture"
            value={newAsset.year_of_manufacture}
            onChange={handleChange}
            label={t("assets.create.fields.yearOfManufacture")}
            placeholder= "0"
          />
          <InputField
            type="date"
            name="battery_charge_due_date"
            value={newAsset.battery_charge_due_date}
            onChange={(e) => {
                const dateValue = e.target.value;
                setNewAsset({ ...newAsset, battery_charge_due_date: dateValue });
            }}
            required
            label={t("assets.create.fields.batteryChargeDate")}
              placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.batteryChargeDate" 
            )}`}
          />
          <InputField
            type="number"
            name="capacity"
            value={newAsset.capacity}
            onChange={handleChange}
            label={t("assets.create.fields.capacity")}
            placeholder= "0"
          />
          <InputField
            type="number"
            name="operating_hours"
            value={newAsset.operating_hours}
            onChange={handleChange}
            label={t("assets.create.fields.operatingHours")}
            placeholder= "0"
          />
          <InputField
            type="date"
            name="warranty_expiration_date"
            value={newAsset.warranty_expiration_date}
            onChange={(e) => {
                const dateValue = e.target.value;
                setNewAsset({ ...newAsset, warranty_expiration_date: dateValue });
            }}
            required
            label={t("assets.create.fields.warrantyExpiration")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.warrantyExpiration"
            )}`}
          />
          <SelectField
            name="fuel_type"
            value={newAsset.fuel_type}
            onChange={handleChange}
            required
            label={t("assets.create.fields.fuelType")}
            menus={[
              { value: "", option: t("assets.create.placeholders.select") },
              { value: "Diesel", option: t("assets.create.fuelTypes.diesel") },
              {
                value: "Electric",
                option: t("assets.create.fuelTypes.electric"),
              },
              { value: "Hybrid", option: t("assets.create.fuelTypes.hybrid") },
            ]}
          />

          <InputField
            name="notes"
            value={newAsset.notes}
            onChange={handleChange}
            required
            label={t("assets.create.fields.notes")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.notes"
            )}`}
          />
          <InputField
            name="battery_description"
            value={newAsset.battery_description}
            onChange={handleChange}
            label={t("assets.create.fields.batteryDescription")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.batteryDescription"
            )}`}
          />
          <InputField
            type="number"
            name="fuel_consumption"
            value={newAsset.fuel_consumption}
            onChange={handleChange}
            label={t("assets.create.fields.fuelConsumption")}
            placeholder= "0"
          />
          <InputField
            name="lease_company"
            value={newAsset.lease_company}
            onChange={handleChange}
            label={t("assets.create.fields.leaseCompany")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.leaseCompany"
            )}`}
          />
          <InputField
            type="number"
            name="machine_category"
            value={newAsset.machine_category}
            onChange={handleChange}
            label={t("assets.create.fields.machineCategory")}
            placeholder= "0"
          />
          <InputField
            type="number"
            name="maintenance_costs"
            value={newAsset.maintenance_costs}
            onChange={handleChange}
            label={t("assets.create.fields.maintenanceCosts")}
            placeholder="0"
          />
          <InputField
            name="operational_status"
            value={newAsset.operational_status}
            onChange={handleChange}
            required
            label={t("assets.create.fields.operationalStatus")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.operationalStatus"
            )}`}
          />

          <InputField
            type="number"
            name="purchase_price"
            value={newAsset.purchase_price}
            onChange={handleChange}
            label={t("assets.create.fields.purchasePrice")}
            placeholder= "0"
          />
          <InputField
            type="number"
            name="residual_value"
            value={newAsset.residual_value}
            onChange={handleChange}
            label={t("assets.create.fields.residualValue")}
            placeholder= "0"
          />
          <InputField
            name="serial_number"
            value={newAsset.serial_number}
            onChange={handleChange}
            required
            label={t("assets.create.fields.serialNumber")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.serialNumber"
            )}`}
          />
          <SelectField
            name="status"
            value={newAsset.status}
            onChange={handleChange}
            required
            label={t("assets.create.fields.status")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.status"
            )}`}
            menus={[
              { value: "", option: t("assets.create.placeholders.select") },
              { value: "New", option: t("assets.create.status.new") },
              { value: "Used", option: t("assets.create.status.used") },
              { value: "Miete", option: t("assets.create.status.hire") },
            ]}
          />
          <InputField
            type="number"
            name="total_operating_costs"
            value={newAsset.total_operating_costs}
            onChange={handleChange}
            label={t("assets.create.fields.totalOperatingCosts")}
            placeholder= "0"
          />
          <InputField
            type="date"
            name="uvv_due_date"
            value={newAsset.uvv_due_date}
            onChange={(e) => {
                const dateValue = e.target.value;
                setNewAsset({ ...newAsset, uvv_due_date: dateValue });
            }}
            required
            label={t("assets.create.fields.uvvDueDate")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.uvvDueDate"
            )}`}
          />
          <InputField
            name="mast"
            value={newAsset.mast}
            onChange={handleChange}
            required
            label={t("assets.create.fields.mast")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.mast"
            )}`}
          />
          <InputField
            name="battery"
            value={newAsset.battery}
            onChange={handleChange}
            required
            label={t("assets.create.fields.battery")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.battery"
            )}`}
          />
          <InputField
            name="warranty"
            value={newAsset.warranty}
            onChange={handleChange}
            required
            label={t("assets.create.fields.warranty")}
            placeholder={`${t("assets.create.placeholders.enter")} ${t(
              "assets.create.fields.warranty"
            )}`}
          />
          <div className="form-group">
            <label>{t("assets.create.fields.attachments")}</label>
            <input
              type="file"
              className="form-control"
              onChange={handleChange}
              multiple
              accept="image/jpeg,image/png,application/pdf,.doc,.docx,.xls,.xlsx"
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
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" type="submit">
            {t("common.create")}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

CreateAssetModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateAssetModal;
