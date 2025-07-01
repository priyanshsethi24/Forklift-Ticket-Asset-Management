import PropTypes from "prop-types";
import {
  FaTimes,
  FaUpload,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaDownload,
  FaClipboardList,
  FaTools,
  FaListUl,
  FaPaperclip,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InputField from "../../SharedComponent/Fields/InputField";
import TextareaField from "../../SharedComponent/Fields/TextareaField";
import SelectField from "../../SharedComponent/Fields/SelectField";
import Button from "../../SharedComponent/Button/Button";
import { API_END_POINTS } from "../../network/apiEndPoint";
import {
  getProtected,
  postProtected,
  patchProtected,
} from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Stepper from "./Stepper/Stepper";
import { useLocation } from "react-router-dom";

const initialAssets = {
  documents: [],
  platform: "",
  visible: true,
  insertDate: "",
  id: null,
  machineIdDealer: "",
  idUrl: "",
  manufacturer: "",
  type: "",
  yearOfManufacture: 0,
  operatingHours: 0,
  machineSerialNo: "",
  classification: "",
  forkliftClass: "",
  antriebsart: "",
  machineDescriptionTitle: "",
  machineDescriptionSubtitle: "",
  machineDescriptionTemp: "",
  machineAvailable: true,
  truckLocation: "",
  salesmen: [],
  priceType: "",
  techCondition: "",
  reconditioningDate: "",
  offerNoDealer: "",
  offerNoPlatform: "",
  machineLength: 0,
  machineWidth: 0,
  machineHeight: 0,
  basketLoad: 0,
  reachHorizontal: 0,
  machineWeight: 0,
  closedHeight: 0,
  freeHeight: 0,
  forkCarriage: "",
  forkLength: 0,
  loadCentre: 0,
  tiresFront: "",
  tiresFront_size: "",
  tiresRear: "",
  tiresRear_size: "",
  twinTires: false,
  addEquipment: [],
  mediaFiles: [],
};

const getFileInfo = (url) => {
  const extension = url.split(".").pop().toLowerCase();
  const fileTypes = {
    pdf: {
      type: "application/pdf",
      icon: <FaFilePdf size={20} className="text-danger" />,
    },
    xlsx: {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      icon: <FaFileExcel size={20} className="text-success" />,
    },
    xls: {
      type: "application/vnd.ms-excel",
      icon: <FaFileExcel size={20} className="text-success" />,
    },
    doc: {
      type: "application/msword",
      icon: <FaFileWord size={20} className="text-primary" />,
    },
    docx: {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      icon: <FaFileWord size={20} className="text-primary" />,
    },
  };
  return (
    fileTypes[extension] || {
      type: "application/octet-stream",
      icon: <FaFile size={20} />,
    }
  );
};

const handleDownload = async (url, filename) => {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const fileInfo = getFileInfo(url);
    const blobWithType = new Blob([blob], { type: fileInfo.type });

    const downloadUrl = window.URL.createObjectURL(blobWithType);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || url.split("/").pop();
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
  }
};

const AttachmentLink = ({ url, children }) => {
  const filename = url.split("/").pop();
  const fileInfo = getFileInfo(url);
  const [clickTimeout, setClickTimeout] = useState(null);

  const handleClick = (e) => {
    e.preventDefault();

    if (clickTimeout === null) {
      setClickTimeout(
        setTimeout(() => {
          window.open(url, "_blank");
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
      style={{ cursor: "pointer" }}
      title={`Click to view, double click to download ${filename}`}
    >
      <div className="file-icon me-2">{fileInfo.icon}</div>
      <span className="file-name flex-grow-1">{filename}</span>
      <small className="text-muted me-2">
        <em>Click to view, double click to download</em>
      </small>
    </div>
  );
};

// Add these options to the top of the file with other constants
const TIRE_OPTIONS = [
  "Cushion",
  "Pneumatic",
  "Polyurethane",
  "Solid Rubber",
  "Super Elastic",
];

const CONDITION_OPTIONS = [
  "New",
  "Like New",
  "Very Good",
  "Good",
  "Normal",
  "Bad",
  "Very Bad",
];

const ATTACHMENT_OPTIONS = [
  "Side Shifter",
  "Double Clamp",
  "Double Side Shifter",
  "Rotator",
  "Triple Clamp",
  "Triple Side Shifter",
  "Drum Clamp",
  "Fork Extension",
  "Clamp Fork",
  "Load Guard",
  "Push Fork",
  "Bulk Material Bucket",
  "Load Pin",
  "Fork Positioner",
  "Double Pallet Clamp",
  "Fork Pallet Coupler",
];

const ADD_EQUIPMENT_OPTIONS = [
  "3rd Valve",
  "4th Valve",
  "Rear Work Light",
  "Front Work Light",
  "Roof Cover",
  "Front Window",
  "Half Cabin",
  "Heater",
  "Load Guard",
  "Solenoid Valve",
  "Oil Separator",
  "Soot Filter",
  "Road Use Approved",
  "Full Cabin",
  "Explosion Proof",
  "Impulse Control",
  "Initial Lift",
  "Air Conditioning",
  "Full Free Lift",
  "CE Certificate",
];

const EditAssetPage = ({ show, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const assetData = location.state?.assetData;
  const [newAsset, setNewAsset] = useState(assetData || { ...initialAssets });
  const [attachments, setAttachments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [nettoPrice, setNettoPrice] = useState("");
  const [nettoCurrency, setNettoCurrency] = useState("Netto_euro");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [selectedVisibleOption, setSelectedVisibleOption] = useState("");
  const [uniqueID, setUniqueID] = useState("");
  const [machineAvailable, setMachineAvailable] = useState("");
  const [loadCentre, setLoadCentre] = useState(0);
  const [selectedAttachment, setSelectedAttachment] = useState("");
  const [customAttachment, setCustomAttachment] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [assets, setAssets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);


  const categories = [
    "Forklifts",
    "Batteries",
    "Chargers",
    "Attachments",
    "Lift Masts",
    "Work Platforms",
    "Cleaning Equipment",
    "Spare Parts",
    "Construction Machinery",
  ];
  const [selectedCategory, setSelectedCategory] = useState("Forklifts");
  const steps = [
    { title: t("assets.create.steps.truckbasic"), icon: <FaClipboardList /> },
    { title: t("assets.create.steps.truckdescription"), icon: <FaTools /> },
    {
      title: t("assets.create.steps.financialInformation"),
      icon: <FaListUl />,
    },
    {
      title: t("assets.create.steps.dealerInformation"),
      icon: <FaPaperclip />,
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
          if (files && files.length > 0) {
            const fileArray = Array.from(files);
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            const validFileTypes = {
              "image/jpeg": "image",
              "image/png": "image",
              "image/gif": "image",
              "application/pdf": "document",
              "application/msword": "document",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                "document",
              "application/vnd.ms-excel": "document",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                "document",
            };

            const validFiles = fileArray.filter((file) => {
              if (!validFileTypes[file.type]) {
                toast.error(
                  `File ${file.name} is not a valid type. Allowed types: Images (JPEG, PNG, GIF) and Documents (PDF, DOC, DOCX, XLS, XLSX)`
                );
                return false;
              }

              if (file.size > maxFileSize) {
                toast.error(
                  `File ${file.name} is too large. Maximum size is 10MB.`
                );
                return false;
              }

              return true;
            });

            if (validFiles.length > 0) {
              const filesWithType = validFiles.map((file) => ({
                file,
                type: validFileTypes[file.type],
                preview:
                  validFileTypes[file.type] === "image"
                    ? URL.createObjectURL(file)
                    : null,
                name: file.name,
              }));

              setAttachments((prev) => [...prev, ...filesWithType]);
              setShowAttachments(true);
            }
          }
        } else {
          setNewAsset((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "status" && { condition: value }),
          }));
        }
      };
    } else {
      if (name === "machineAvailable") {
        setMachineAvailable(value);
      } else {
        setNewAsset((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...newAsset,
        // Add any specific fields that need to be formatted
        machineAvailable: machineAvailable === "true" || machineAvailable === true,
        loadCentre: Number(loadCentre),
        // Add other fields that need type conversion
      };

      // Remove any undefined or null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      // Ensure we have the asset ID
      if (!assetData?.id) {
        toast.error("Asset ID is missing");
        return;
      }

      const response = await patchProtected(
        `${API_END_POINTS.assets}/${assetData.id}`,
        payload
      );

      if (response) {
        toast.success(t("assetUpdate.messages.updateSuccess"));
        // Optionally close modal or redirect
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Update error:", error);
      const message = error?.response?.data?.messages?.[0]?.message;
      toast.error(message || t("assetUpdate.messages.updateError"));
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlatformChange = (e) => {
    const value = e.target.value;
    setSelectedPlatform(value);

    // Clear custom input if a predefined option is selected
    if (value !== "other") {
      setCustomPlatform("");
    }
  };

  const handleVisibleChange = (e) => {
    setSelectedVisibleOption(e.target.value);
  };

  const generateUniqueID = () => {
    const randomID = Math.floor(1000000 + Math.random() * 9000000).toString();
    setUniqueID(randomID);
  };

  useEffect(() => {
    generateUniqueID();
  }, []);

  const handleUniqueIDChange = (e) => {
    setUniqueID(e.target.value);
  };

  const handleAttachmentChange = (e) => {
    const value = e.target.value;
    setSelectedAttachment(value);

    // Clear custom input if a predefined option is selected
    if (value !== "other") {
      setCustomAttachment("");
    }
  };
  const handleEquipmentChange = (e) => {
    const value = e.target.value;

    // If "other" is selected, keep the custom equipment input; otherwise, clear it
    if (value === "other") {
      setSelectedEquipment((prev) => [...prev, value]); // Add "other" to selected equipment
    } else {
      setSelectedEquipment(value); // Set selected equipment to the chosen option
      setCustomEquipment(""); // Clear custom equipment input
    }
  };

  // Example of defining visibleOptions based on some criteria
  const visibleOptions = attachments.filter(
    (attachment) => attachment.isVisible
  );

  // New function to handle step click
  const handleStepClick = (index) => {
    setCurrentStep(index);
  };

  const Step = ({ step, index, currentStep, steps, handleStepClick }) => {
    return (
      <div
        className={`flex flex-col items-center mx-1 sm:mx-2 md:mx-4 ${
          index === 0
            ? "step1"
            : index === 1
            ? "step2"
            : index === 2
            ? "step3"
            : "step4"
        }`}
        key={index}
        onClick={() => handleStepClick(index)}
      >
        <div
          className={`flex items-center justify-center -full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 cursor-pointer transition-colors duration-300 ${
            currentStep >= index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
          }`}
        >
          {step.icon}
        </div>
        
        {index < steps.length - 1 && (
          <div className="hidden sm:block h-1 w-16 md:w-24 lg:w-32 bg-gray-200 mt-4">
            <div 
              className={`h-full ${currentStep > index ? "bg-blue-500" : "bg-gray-200"}`} 
            />
          </div>
        )}
        
        <div
          className={`mt-2 text-xs sm:text-sm md:text-base text-center transition-colors duration-300 ${
            currentStep === index ? "font-bold text-black" : "font-normal text-gray-500"
          }`}
        >
          {step.title}
        </div>
      </div>
    );
  };

  const ButtonList = () => {
    return (
      <div className="mx-4 max-w-screen overflow-x-auto my-2 flex items-center justify-center bg-white py-2 shadow-md  ">
        <div className="flex space-x-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`  font-medium  py-[.5rem] px-[.8rem] gap-2 transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => {
                setSelectedCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto  w-full min-h-screen bg-gray-100 pt-20 ">
    <h1 className="px-4 py-2  font-medium text-3xl ">Edit Asset</h1>
    <ButtonList />
     <div className="w-full  p-2 ">
      <div className="flex flex-col sm:flex-row justify-between items-center ">
        {steps.map((step, index) => (
          <Step
            key={index}
            step={step}
            index={index}
            currentStep={currentStep}
            steps={steps}
            handleStepClick={handleStepClick}
          />
        ))}
      </div>
      
      {/* Responsive connector lines for mobile view */}
      <div className="flex justify-center sm:hidden mt-2">
        {steps.slice(0, -1).map((_, index) => (
          <div 
            key={index} 
            className={`h-1 w-6 mx-1 ${
              currentStep > index ? "bg-blue-500" : "bg-gray-200"
            }`} 
          />
        ))}
      </div>
    </div>
      <form onSubmit={handleUpdateAsset} className="w-full px-4 py-6">
      {currentStep === 0 && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <InputField
                type="text"
                value={uniqueID}
                onChange={handleUniqueIDChange}
                placeholder={t("createAsset.placeholder.enterUniqueID")}
                maxLength={7}
                label={t("assets.fields.uniqueID")}
                explanation={t("assets.fields.explanation.uniqueID")}
              />
              <InputField
                name="machineSerialNo"
                value={newAsset.machineSerialNo}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.enterSerialNumber")}
                label={t("assets.fields.machineSerialNo")}
                explanation={t("assets.fields.explanation.machineSerialNo")}
              />


              <SelectField
                name="platform"
                value={selectedPlatform}
                onChange={handlePlatformChange}
                label={t("assets.create.fields.platform")}
                explanation={t("assets.fields.explanation.platform")}
                placeholder={t("createAsset.placeholder.enterPlatform")}
                menus={[
                  { value: "", option: t("assets.fields.selectPlatform") },
                  { value: "dealerSearch", option: "Dealer Search" },
                  { value: "endCustomerSearch", option: "End Customer Search" },
                  { value: "rentalEquipment", option: "Rental Equipment" },
                  { value: "homepage", option: "Homepage" },
                  { value: "manufacturerPage", option: "Manufacturer Page" },
                  { value: "other", option: "Other: Manual Text Input" },
                ]}
              />
              <SelectField
                name="visibleOptions"
                value={selectedVisibleOption}
                onChange={handleVisibleChange}
                label={t("assets.fields.visible")}
              explanation={t("assets.fields.explanation.visible")}
                placeholder={t("createAsset.placeholder.enterVisibleOption")}
                menus={[
                  {
                    value: "",
                    option: t("assets.create.fields.selectVisibleOption"),
                  },
                  { value: "dealerSearch", option: "Dealer Search" },
                  { value: "endCustomerSearch", option: "End Customer Search" },
                  { value: "rentalEquipment", option: "Rental Equipment" },
                  { value: "homepage", option: "Homepage" },
                  { value: "manufacturerPage", option: "Manufacturer Page" },
                ]}
                className="input-field"
              />

              <InputField
                name="insertDate"
                type="date"
                onChange={handleChange}
                className="input-field"
                label={t("assets.fields.date")}
              explanation={t("assets.fields.explanation.insertDate")}
              />

              <InputField
                name="machineIdDealer"
                value={newAsset.machineIdDealer}
                onChange={handleChange}
                label={t("assets.fields.dealerId")}
              explanation={t("assets.fields.explanation.dealerId")}
                placeholder={t("createAsset.placeholder.enterMachineIdDealer")}
              />

              <InputField
                name="manufacturer"
                value={newAsset.manufacturer}
                onChange={handleChange}
                label={t("assets.fields.manufacturer")}
              explanation={t("assets.fields.explanation.manufacturer")}
                placeholder={t("createAsset.placeholder.enterManufacturer")}
              />

              <InputField
                name="yearOfManufacture"
                value={newAsset.yearOfManufacture || ""}
                onChange={handleChange}
                label={t("assets.fields.yearOfManufacture")}
              explanation={t("assets.fields.explanation.yearOfManufacture")}
                placeholder={t("createAsset.placeholder.enterYearOfManufacture")}
                type="date"
              />

              <InputField
                name="operatingHours"
                type="text"
                value={newAsset.operatingHours}
                onChange={handleChange}
                label={t("assets.fields.operatingHours")}
              explanation={t("assets.fields.explanation.operatingHours")}
                placeholder= "0"
              />
           
              <InputField
                name="capacity"
                type="number"
                value={newAsset.capacity}
                onChange={handleChange}
                label={t("assets.fields.capacity")}
              explanation={t("assets.fields.explanation.capacity")}
                placeholder={t("createAsset.placeholder.enterCapacity")}
              />
              <SelectField
                name="mastType"
                value={newAsset.mastType}
                onChange={handleChange}
                label={t("assets.fields.mastType")}
                explanation={t("assets.fields.explanation.mastType")}
                placeholder={t("createAsset.placeholder.enterMastType")}
                menus={[
                  {
                    value: "",
                    option: t("assets.create.fields.selectMastType"),
                  },
                  { value: "None", option: "None" },
                  { value: "Standard", option: "Standard" },
                  { value: "Duplex", option: "Duplex" },
                  { value: "Triplex", option: "Triplex" },
                  { value: "Quattro", option: "Quattro" },
                  { value: "Telescopic", option: "Telescopic" },
                ]}
              />
              <SelectField
                name="status"
                value={newAsset.status}
                onChange={handleChange}
                label={t("assets.fields.status")}
              explanation={t("assets.fields.explanation.status")}
                placeholder={t("createAsset.placeholder.enterStatus")}
                menus={[
                  { value: "", option: t("assets.fields.selectStatus") },
                  { value: "Demo", option: "Demo" },
                  { value: "Rental", option: "Rental" },
                  { value: "New", option: "New" },
                  { value: "Used", option: "Used" },
                ]}
              />
              <SelectField
                name="classification"
                value={newAsset.classification}
                onChange={handleChange}
                label={t("assets.fields.classification")}
              explanation={t("assets.fields.explanation.classification")}
                placeholder={t("createAsset.placeholder.enterClassification")}
                menus={[
                  {
                    value: "",
                    option: t("assets.fields.selectClassification"),
                  },
                  { value: "Trailer", option: "Trailer" },
                  { value: "Tractor", option: "Tractor" },
                  {
                    value: "Manual Pallet Truck",
                    option: "Manual Pallet Truck",
                  },
                  {
                    value: "High Lift Pallet Truck",
                    option: "High Lift Pallet Truck",
                  },
                  { value: "Petrol Forklift", option: "Petrol Forklift" },
                  { value: "Diesel Forklift", option: "Diesel Forklift" },
                  { value: "Electric 3-Wheel", option: "Electric 3-Wheel" },
                  { value: "Electric 4-Wheel", option: "Electric 4-Wheel" },
                  {
                    value: "Natural Gas Forklift",
                    option: "Natural Gas Forklift",
                  },
                  { value: "Reach Stacker", option: "Reach Stacker" },
                  { value: "Side Loader", option: "Side Loader" },
                  { value: "Other", option: "Other" },
                  { value: "Compact Forklift", option: "Compact Forklift" },
                  {
                    value: "Low Lift Pallet Truck",
                    option: "Low Lift Pallet Truck",
                  },
                  {
                    value: "All-Terrain Forklift",
                    option: "All-Terrain Forklift",
                  },
                  {
                    value: "Truck-Mounted Forklift",
                    option: "Truck-Mounted Forklift",
                  },
                  { value: "Scissor Lift", option: "Scissor Lift" },
                  {
                    value: "Telescopic Forklift",
                    option: "Telescopic Forklift",
                  },
                  { value: "Terminal Tractor", option: "Terminal Tractor" },
                  { value: "LPG Forklift", option: "LPG Forklift" },
                  { value: "Container Handler", option: "Container Handler" },
                  { value: "Reach Truck", option: "Reach Truck" },
                  {
                    value: "Narrow Aisle Forklift",
                    option: "Narrow Aisle Forklift",
                  },
                  { value: "Stand-On Forklift", option: "Stand-On Forklift" },
                  {
                    value: "Pallet Truck with Scale",
                    option: "Pallet Truck with Scale",
                  },
                  {
                    value: "Tugger Train Trailer",
                    option: "Tugger Train Trailer",
                  },
                  {
                    value: "Multi-Directional Side Loader",
                    option: "Multi-Directional Side Loader",
                  },
                  {
                    value: "Electric Platform Truck",
                    option: "Electric Platform Truck",
                  },
                  {
                    value: "Vertical Order Picker",
                    option: "Vertical Order Picker",
                  },
                  {
                    value: "Multi-Directional Reach Truck",
                    option: "Multi-Directional Reach Truck",
                  },
                  {
                    value: "Horizontal Order Picker",
                    option: "Horizontal Order Picker",
                  },
                  { value: "Battery", option: "Battery" },
                ]}
              />
              <SelectField
                name="forkliftClass"
                value={newAsset.forkliftClass}
                onChange={handleChange}
                label={t("assets.fields.femClass")}
              explanation={t("assets.fields.explanation.femClass")}
                placeholder={t("createAsset.placeholder.enterFemClass")}
                menus={[
                  { value: "", option: t("assets.fields.selectForkliftClass") },
                  { value: "1", option: "1" },
                  { value: "2", option: "2" },
                  { value: "3", option: "3" },
                  { value: "4", option: "4" },
                  { value: "5", option: "5" },
                ]}
              />

              <SelectField
                name="antriebsart"
                value={newAsset.antriebsart}
                onChange={handleChange}
                label={t("assets.fields.driveType")}
                explanation={t("assets.fields.explanation.driveType")}
                placeholder={t("createAsset.placeholder.enterDriveType")}
                menus={[
                  { value: "", option: t("assets.fields.selectDriveType") },
                  { value: "Diesel", option: "Diesel" },
                  { value: "Electric", option: "Electric" },
                  { value: "LPG", option: "LPG" },
                  { value: "Manual", option: "Manual" },
                  { value: "Petrol-Gas", option: "Petrol-Gas" },
                  { value: "Natural Gas", option: "Natural Gas" },
                ]}
              />
              <InputField
                name="machineDescriptionTitle"
                value={newAsset.machineDescriptionTitle}
                onChange={handleChange}
                label={t("assets.fields.title")}
              explanation={t("assets.fields.explanation.title")}
                placeholder={t("createAsset.placeholder.enterTitle")}
              />

              <InputField
                name="machineDescriptionSubtitle"
                value={newAsset.machineDescriptionSubtitle}
                onChange={handleChange}
                label={t("assets.fields.description")}
              explanation={t("assets.fields.explanation.description")}
                placeholder={t("createAsset.placeholder.enterDescription")}
              />

              <InputField
                name="machineDescriptionTemp"
                value={newAsset.machineDescriptionTemp}
                onChange={handleChange}
                label={t("assets.fields.temporaryDescription")}
              explanation={t("assets.fields.explanation.temporaryDescription")}
                placeholder={t("createAsset.placeholder.enterTemporaryDescription")}
              />
              <InputField
                name="machineAvailable"
                value={machineAvailable}
                onChange={handleChange}
                label={t("assets.fields.availableFrom")}
              explanation={t("assets.fields.explanation.availableFrom")}
                placeholder={t("createAsset.placeholder.enterAvailableFrom")}

                maxLength={100}
              />
              <InputField
                name="truckLocation"
                value={newAsset.truckLocation}
                onChange={handleChange}
                label={t("assets.fields.currentLocation")}
              explanation={t("assets.fields.explanation.currentLocation")}
                placeholder={t("createAsset.placeholder.enterCurrentLocation")}
              />
              <InputField
                name="liftHeight"
                type="number"
                value={newAsset.liftHeight || ""}
                onChange={handleChange}
                label={t("assets.fields.liftHeight")}
              explanation={t("assets.fields.explanation.liftHeight")}
                placeholder={t("createAsset.placeholder.enterLiftHeight")}
              />

              <InputField
                name="salesmen"
                value={newAsset.salesmen}
                onChange={(e) =>
                  setNewAsset({
                    ...newAsset,
                    salesmen: e.target.value.split(", "),
                  })
                }
                label={t("assets.fields.salesmen")}
              explanation={t("assets.fields.explanation.salesmen")} 
                placeholder={t("createAsset.placeholder.enterSalesmen")}
              />
              <InputField
                name="adGroup"
                value={newAsset.adGroup || ""}
                onChange={handleChange}
                label={t("assets.fields.adGroup")}
              explanation={t("assets.fields.explanation.adGroup")}
                placeholder={t("createAsset.placeholder.enterAdGroup")}
              />
              <InputField
                name="idUrl"
                value={newAsset.idUrl}
                onChange={handleChange}
                label={t("assets.fields.idUrl")}
              explanation={t("assets.fields.explanation.idUrl")}
                placeholder={t("createAsset.placeholder.enterIdUrl")}
              />

              <InputField
                name="type"
                value={newAsset.type}
                onChange={handleChange}
                label={t("assets.fields.type")}
              explanation={t("assets.fields.explanation.type")}
                placeholder={t("createAsset.placeholder.enterType")}
              />

              <SelectField
                name="priceType"
                value={newAsset.priceType}
                onChange={(e) => {
                  setNewAsset({ ...newAsset, priceType: e.target.value });
                }}
                label={t("assets.fields.priceType")}
                explanation={t("assets.fields.explanation.priceType")}
                placeholder={t("createAsset.placeholder.enterPriceType")}
                required
                menus={[
                  { value: "", option: t("createAsset.placeholder.enterPriceType") },
                  {
                    value: "priceRental_day",
                    option: t("createAsset.placeholder.enterRentalPriceDay"),
                  },
                  {
                    value: "priceRental_week",
                    option: t("createAsset.placeholder.enterRentalPriceWeek"),
                  },
                  {
                    value: "priceRental_month",
                    option: t("createAsset.placeholder.enterRentalPriceMonth"),
                  },
                ]}
              />

            <div className="form-group">
              <label>{t("assets.create.fields.price")}</label>
              <div className="input-group">
                <select
                  className="form-select"
                  style={{
                    maxWidth: "80px",
                    borderRight: "none",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="Dollar">
                    {t("assets.create.fields.currency.dollar")}
                  </option>
                  <option value="Euro">
                    {t("assets.create.fields.currency.euro")}
                  </option>
                  <option value="GBP">
                    {t("assets.create.fields.currency.gbp")}
                  </option>
                </select>
                <input
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t("createAsset.placeholder.enterAmountIn", {
                    currency,
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-group">
              <label>{t("assets.create.fields.netPrice")}</label>
              <div className="input-group">
                <select
                  className="form-select"
                  style={{
                    maxWidth: "80px",
                    borderRight: "none",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  value={nettoCurrency}
                  onChange={(e) => setNettoCurrency(e.target.value)}
                >
                  <option value="Netto_euro">
                    {t("assets.create.fields.currency.nettoEuro")}
                  </option>
                  <option value="NettoDollar">
                    {t("assets.create.fields.currency.nettoDollar")}
                  </option>
                  <option value="NettoGbp">
                    {t("assets.create.fields.currency.nettoGbp")}
                  </option>
                </select>
                <input
                  type="number"
                  className="form-control"
                  value={nettoPrice}
                  onChange={(e) => setNettoPrice(e.target.value)}
                  placeholder={t("createAsset.placeholder.enterNettoAmountIn", {
                    currency:
                      nettoCurrency.split("_")[1] ||
                      nettoCurrency.replace("Netto", ""),
                  })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-group">
              <InputField
                type="file"
                className="form-control"
                onChange={handleChange}
                label={t("assets.create.fields.mediaFiles")}
                explanation={t("assets.fields.explanation.mediaFiles")}
                multiple
                accept="image/jpeg,image/png,image/gif,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <small className="text-muted">
                {t("assets.create.fileUpload.supportedFormats")}
              </small>

              {showAttachments && attachments.length > 0 && (
                <div className="selected-files mt-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="file-item d-flex align-items-center p-2 border rounded mb-2"
                    >
                      {attachment.type === "image" ? (
                        <div className="file-preview me-2">
                          <img
                            src={attachment.preview}
                            alt={t("assets.create.fileUpload.preview.imageAlt")}
                            style={{
                              height: "40px",
                              width: "40px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="file-icon me-2">
                          {attachment.file.type === "application/pdf" ? (
                            <FaFilePdf size={24} className="text-danger" />
                          ) : attachment.file.type.includes("spreadsheet") ||
                            attachment.file.type.includes("excel") ? (
                            <FaFileExcel size={24} className="text-success" />
                          ) : attachment.file.type.includes("word") ? (
                            <FaFileWord size={24} className="text-primary" />
                          ) : (
                            <FaFile size={24} className="text-secondary" />
                          )}
                        </div>
                      )}
                      <span className="file-name flex-grow-1">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px", padding: "0" }}
                        aria-label={t("assets.create.fileUpload.removeFile")}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            </div>

          </>
        )}
        {currentStep === 1 && (
          <>
            <h4>{t("assets.create.sections.technicalCondition")}</h4>
            <SelectField
              name="techCondition"
              value={newAsset.techCondition}
              onChange={handleChange}
              label={t("assets.create.fields.technicalCondition")}
              explanation={t("assets.fields.explanation.technicalCondition")}
              placeholder={t("createAsset.placeholder.enterCondition")}
              menus={[
                { value: "", option: t("assets.fields.selectCondition") },
                { value: "new", option: t("assets.fields.conditions.new") },
                {
                  value: "likenew",
                  option: t("assets.fields.conditions.likenew"),
                },
                {
                  value: "verygood",
                  option: t("assets.fields.conditions.verygood"),
                },
                { value: "good", option: t("assets.fields.conditions.good") },
                {
                  value: "normal",
                  option: t("assets.fields.conditions.normal"),
                },
                { value: "bad", option: t("assets.fields.conditions.bad") },
                {
                  value: "verybad",
                  option: t("assets.fields.conditions.verybad"),
                },
              ]}
            />
            <div className="row">
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="machineLength"
                  value={newAsset.machineLength}
                  onChange={handleChange}
                  label={t("assets.create.fields.machineLength")}
                  explanation="Length of the machine"
                  placeholder = "0"
                />
              </div>
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="machineWidth"
                  value={newAsset.machineWidth>0 && newAsset.machineWidth}
                  onChange={handleChange}
                  label={t("assets.create.fields.machineWidth")}
                  explanation="Width of the machine"
                  placeholder = "0"
                />

              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="machineHeight"
                  value={newAsset.machineHeight}
                  onChange={handleChange}
                  label={t("assets.create.fields.machineHeight")}
                  explanation="Height of the machine"
                  placeholder = "0"
                />
              </div>
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="basketLoad"
                  value={newAsset.basketLoad}
                  onChange={handleChange}
                  label={t("assets.create.fields.basketLoad")}
                  explanation="Basket load of the machine"
                  placeholder = "0"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="reachHorizontal"
                  value={newAsset.reachHorizontal}
                  onChange={handleChange}
                  label={t("assets.create.fields.reachHorizontal")}
                  explanation="Vertical reach of the machine"
                  placeholder = "0"
                />
              </div>
              <div className="col-md-6">
                <InputField
                  type="number"
                  name="machineWeight"
                  value={newAsset.machineWeight}
                  onChange={handleChange}
                  label={t("assets.create.fields.machineWeight")}
                  explanation="Weight of the machine"
                  placeholder = "0"
                />
              </div>
            </div>
            <InputField
              name="reconditioningDate"
              type="date"
              value={newAsset.reconditioningDate || ""}
              onChange={handleChange}
              label="Reconditioning Date"
              explanation="Reconditioning date of the machine"
            />
            <div className="row">
              <div className="col-md-6">
                <InputField
                  name="workingHeight"
                  type="number"
                  value={newAsset.workingHeight}
                  onChange={handleChange}
                  label="Working Height"
                  explanation="Working height of the machine" 
                  placeholder={t("createAsset.placeholder.workingHeight")}
                />
              </div>
              <div className="col-md-6">
                <SelectField
                  name="batteryCategory"
                  value={newAsset.batteryCategory}
                  onChange={handleChange}
                  label="Battery Category"
                  explanation="Category of the battery"
                  menus={[
                    { value: "", option: "Select Battery Category" },
                    { value: "PzS", option: "PzS" },
                    { value: "Gel", option: "Gel" },
                    { value: "Lithium-Ion", option: "Lithium-Ion" },
                    { value: "Starter", option: "Starter" },
                    { value: "Waterless", option: "Waterless" },
                    { value: "Lead Acid", option: "Lead Acid" },
                  ]}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <InputField
                  name="batteryVoltage"
                  type="number"
                  value={newAsset.batteryVoltage}
                  onChange={handleChange}
                  label="Battery Voltage"
                  explanation="Voltage of the battery"
                  placeholder={t("createAsset.placeholder.batteryVoltage")}
                />
              </div>
              <div className="col-md-6">
                  <InputField
                    name="batteryCapacity"
                    type="text"
                    value={newAsset.batteryCapacity}
                    onChange={handleChange}
                    label="Battery Capacity"
                    explanation="Capacity of the battery in Ah"
                    placeholder={t("createAsset.placeholder.batteryCapacity")}
                    maxLength={50}
                  />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <SelectField
                  name="batteryCharger"
                  value={newAsset.batteryCharger}
                  onChange={handleChange}
                  label="Battery Charger"
                  explanation="Charger of the battery"
                  menus={[
                    { value: "", option: "Select Battery Charger" },
                    { value: "Single Phase", option: "Single Phase" },
                    { value: "Three Phase", option: "Three Phase" },
                    { value: "HF", option: "HF" },
                    { value: "Integrated", option: "Integrated" },
                  ]}
                  className="input-field"
                />
              </div>
              <div className="col-md-6">
                <InputField
                  name="batteryChargerType"
                  type="text"
                  value={newAsset.batteryChargerType}
                  onChange={handleChange}
                  label="Battery Charger Type"
                  explanation="Type of the battery charger" 
                  placeholder={t("createAsset.placeholder.batteryChargerType")}
                  maxLength={150}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <InputField
                  name="batteryAddEquipment"
                  type="text"
                  value={newAsset.batteryAddEquipment}
                  onChange={handleChange}
                  label="Battery Add Equipment"
                  explanation="Additional equipment for the battery"
                  placeholder={t("createAsset.placeholder.additionalEquipment")}
                  maxLength={150}
                />
              </div>
            </div>

            <h4>{t("assets.create.sections.forksAndCarriage")}</h4>
            <InputField
              name="forkCarriage"
              value={newAsset.forkCarriage}
              onChange={handleChange}
              maxLength={50}
              label={t("assets.create.fields.forkCarriage")}
              explanation="Fork carriage of the machine"
              placeholder={t("createAsset.placeholder.forkCarriage")}  
            />
            <InputField
              type="number"
              name="forkLength"
              value={newAsset.forkLength}
              onChange={handleChange}
              label={t("assets.create.fields.forkLength")}
              explanation="Fork length of the machine"
              placeholder= "0"
            />
            <InputField
              type="number"
              name="loadCentre"
              value={newAsset.loadCentre}
              onChange={handleChange}
              label={t("assets.create.fields.loadCentre")}
              explanation="Load centre of the machine"
              placeholder= "0"
            />  
            <h4>{t("assets.create.sections.tires")}</h4>
            <SelectField
              name="tiresFront"
              value={newAsset.tiresFront}
              onChange={handleChange}
              label={t("assets.create.fields.tiresFront")}
              explanation="Front tires of the machine"
              menus={[
                { value: "", option: t("assets.fields.selectTireType") },
                ...TIRE_OPTIONS.map((type) => ({
                  value: type,
                  option: t(
                    `assets.fields.tireTypes.${type
                      .toLowerCase()
                      .replace(" ", "")}`
                  ),
                })),
              ]}
            />
            <InputField
              name="tiresFront_size"
              type="number"
              value={newAsset.tiresFront_size}
              onChange={handleChange}
              maxLength={50}
              label={t("assets.create.fields.tiresFrontSize")}
              explanation="Front tires size of the machine" 
              placeholder={t("createAsset.placeholder.tiresFrontSize")}
            />
            <SelectField
              name="tiresRear"
              value={newAsset.tiresRear}
              onChange={handleChange}
              label={t("assets.create.fields.selectTireType")}
              explanation="selectTireType"
              menus={[
                { value: "", option: t("assets.fields.selectTireType") },
                ...TIRE_OPTIONS.map((type) => ({
                  value: type,
                  option: t(
                    `assets.fields.tireTypes.${type
                      .toLowerCase()
                      .replace(" ", "")}`
                  ),
                })),
              ]}
            />
            <InputField
              name="tiresRear_size"
              type="number"
              value={newAsset.tiresRear_size}
              onChange={handleChange}
              maxLength={50}
              label={t("assets.create.fields.tiresRearSize")}
              explanation="Rear tires size of the machine"
              placeholder={t("createAsset.placeholder.tiresRearSize")}
            />
            <SelectField
              name="twinTires"
              value={newAsset.twinTires}
              label={t("assets.create.fields.twinTires")}
              explanation="Twin tires of the machine"
              onChange={(e) =>
                setNewAsset({ ...newAsset, twinTires: e.target.value })
              }
              menus={[
                { value: "", option: t("assets.create.fields.selectOption") },
                { value: "yes", option: t("assets.create.fields.yes") },
                { value: "no", option: t("assets.create.fields.no") },
              ]}
            />
            <div className="form-section">         
              <SelectField
                name="attachments"
                value={selectedAttachment}
                onChange={handleAttachmentChange}
                label={t("assets.create.fields.selectAttachment")}
                explanation="Attachments of the machine"
                menus={[
                  { value: "", option: t("assets.fields.selectAttachment") },
                  ...ATTACHMENT_OPTIONS.map((option) => ({
                    value: option,
                    option: option,
                  })),
                  { value: "other", option: t("assets.fields.other") },
                ]}
              />
              {selectedAttachment === "other" && (
                <InputField
                  type="text"
                  value={customAttachment}
                  onChange={(e) => setCustomAttachment(e.target.value)}
                  placeholder={t("createAsset.placeholder.enterCustomAttachment")}
                  className="input-field"
                />
              )}
            </div>
            <div className="form-section">
              <SelectField
                name="equipment"
                value={selectedEquipment}
                onChange={handleEquipmentChange}
                label={t("assets.create.fields.selectEquipment")}
                explanation="Equipment of the machine"  
                menus={[
                  { value: "", option: t("assets.fields.selectEquipment") },
                  ...ADD_EQUIPMENT_OPTIONS.map((option) => ({
                    value: option,
                    option: option,
                  })),
                  { value: "other", option: t("assets.fields.other") },
                ]}
             />
              {selectedEquipment === "other" && (
                <InputField
                  type="text"
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  placeholder={t("createAsset.placeholder.enterCustomEquipment")}
                  className="input-field"
                  maxLength={100}
                />
              )}
            </div>
          </>
        )}
        {currentStep === 2 && (
          <>
              <InputField
                name="dealer"
                value={newAsset.dealer}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.dealerName")}
                label="Dealer" 
                explanation="Enter the dealer name"
                maxLength={150}
              />
              <InputField
                name="dealerStatus"
                value={newAsset.dealerStatus}
                onChange={handleChange}
                label="Dealer Status" 
                explanation="Enter the dealer status"
                placeholder={t("createAsset.placeholder.dealerStatus")}
                maxLength={150}
              />
              <InputField
                name="dealerServiceBrands"
                value={newAsset.dealerServiceBrands}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.dealerServiceBrands")}
                label="Dealer Service Brands" 
                explanation="Enter the dealer service brands"
                className="input-field"
                maxLength={250}
              />
              <InputField
                name="dealerDescr"
                value={newAsset.dealerDescr}
                onChange={handleChange}
                label="Dealer Description" 
                explanation="Enter a description for the dealer"
                placeholder={t("createAsset.placeholder.dealerDescription")}
                maxLength={250}
              />
              <InputField
                name="dealerLogoPicUrl"
                value={newAsset.dealerLogoPicUrl}
                onChange={handleChange}
                label="Dealer Logo URL" 
                explanation="Enter the URL for the dealer logo"
                placeholder={t("createAsset.placeholder.dealerLogoPicUrl")}
              />
              <InputField
                name="dealerPicUrl1"
                type="file"
                onChange={handleChange}
                label="Dealer Picture Upload" 
                explanation="Upload a picture of the dealer"
              />
              <InputField
                name="dealerId"
                value={newAsset.dealerId}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.dealerId")}
                label="Dealer ID" 
                explanation="Enter the dealer ID"
                maxLength={50}
              />
              <InputField
                name="dealerZip"
                value={newAsset.dealerZip}
                onChange={handleChange}
                label="Dealer Zip Code" 
                explanation="Enter the dealer's zip code"
                placeholder={t("createAsset.placeholder.dealerZip")}
                maxLength={20}
              />
              <InputField
                name="dealerCity"
                value={newAsset.dealerCity}
                onChange={handleChange}
                label="Dealer City" 
                explanation="Enter the dealer's city"
                placeholder={t("createAsset.placeholder.dealerCity")}
                maxLength={50}
              />
              <InputField
                name="dealerCountry"
                value={newAsset.dealerCountry}
                onChange={handleChange}
                label="Dealer Country" 
                explanation="Enter the dealer's country"
                placeholder={t("createAsset.placeholder.dealerCountry")}
                maxLength={50}
              />

              <InputField
                name="dealerDetailUrl"
                value={newAsset.dealerDetailUrl}
                onChange={handleChange}
                label="Dealer Detail URL"
                explanation="Enter the dealer detail URL"
                placeholder={t("createAsset.placeholder.dealerDetailUrl")}
              />
              <InputField
                name="dealerWebsite"
                value={newAsset.dealerWebsite}
                onChange={handleChange}
                label="Dealer Website" 
                explanation="Enter the dealer's website"
                placeholder={t("createAsset.placeholder.dealerWebsite")}
              />
              <InputField
                name="dealerContactOwner"
                value={newAsset.dealerContactOwner}
                onChange={handleChange}
                label="Dealer Contact Owner" 
                explanation="Enter the dealer contact owner's name"
                placeholder={t("createAsset.placeholder.dealerContactOwner")}
                maxLength={50}
              />
              <InputField
                name="dealerOwnerTel"
                value={newAsset.dealerOwnerTel}
                onChange={handleChange}
                label="Dealer Owner Telephone" 
                explanation="Enter the dealer owner's telephone number"
                placeholder={t("createAsset.placeholder.dealerOwnerTel")}
              />
              <InputField
                name="dealerOwnerEmail"
                value={newAsset.dealerOwnerEmail}
                onChange={handleChange}
                label="Dealer Owner Email" 
                explanation="Enter the dealer owner's email address"
                placeholder={t("createAsset.placeholder.dealerOwnerEmail")}
              />
              <InputField
                name="dealerOwnerLanguage"
                value={newAsset.dealerOwnerLanguage}
                onChange={handleChange}
                label="Dealer Owner Language" 
                explanation="Enter the dealer owner's language"
                placeholder={t("createAsset.placeholder.dealerOwnerLanguage")}
                maxLength={150}
              />
              <InputField
                name="dealerOwnerCustom"
                value={newAsset.dealerOwnerCustom}
                onChange={handleChange}
                label="Dealer Owner Custom Info" 
                explanation="Enter custom info for the dealer owner"
                placeholder={t("createAsset.placeholder.dealerOwnerCustom")}
                maxLength={250}
              />
              <InputField
                name="dealerContact1Name"
                value={newAsset.dealerContact1Name}
                onChange={handleChange}
                label="Dealer Contact 1 Name" 
                explanation="Enter the name of the first dealer contact"
                placeholder={t("createAsset.placeholder.dealerContact1Name")}
                maxLength={50}
              />
              <InputField
                name="dealerContact1Tel"
                value={newAsset.dealerContact1Tel}
                onChange={handleChange}
                label="Dealer Contact 1 Telephone" 
                explanation="Enter the first dealer contact's telephone number"
                placeholder={t("createAsset.placeholder.dealerContact1Tel")}
              />
              <InputField
                name="dealerContact1Email"
                value={newAsset.dealerContact1Email}
                onChange={handleChange}
                label="Dealer Contact 1 Email" 
                explanation="Enter the first dealer contact's email address"
                placeholder={t("createAsset.placeholder.dealerContact1Email")}
              />
              <InputField
                name="dealerContact1Language"
                value={newAsset.dealerContact1Language}
                onChange={handleChange}
                label="Dealer Contact 1 Language" 
                explanation="Enter the first dealer contact's language"
                placeholder={t("createAsset.placeholder.dealerContact1Language")}
                maxLength={150}
              />
              <InputField
                name="dealerTrucksNo"
                type="number"
                value={newAsset.dealerTrucksNo}
                onChange={handleChange}
                label="Dealer Trucks Number" 
                explanation="Enter the number of trucks for the dealer"
                placeholder={t("createAsset.placeholder.dealerTrucksNo")}
              />
              <InputField
                name="dealerAttachmentNo"
                type="number"
                value={newAsset.dealerAttachmentNo}
                onChange={handleChange}
                label="Dealer Attachments Number" 
                explanation="Enter the number of attachments for the dealer"
                placeholder={t("createAsset.placeholder.dealerAttachmentNo")}
              />
              <InputField
                name="dealerBatteryNo"
                type="number"
                value={newAsset.dealerBatteryNo}
                onChange={handleChange}
                label="Dealer Battery Number" 
                explanation="Enter the number of batteries for the dealer"
                placeholder={t("createAsset.placeholder.dealerBatteryNo")}
              />
              <InputField
                name="dealerChargerNo"
                type="number"
                value={newAsset.dealerChargerNo}
                onChange={handleChange}
                label="Dealer Charger Number" 
                explanation="Enter the number of chargers for the dealer"
                placeholder={t("createAsset.placeholder.dealerChargerNo")}
              />
              <InputField
                name="dealerAccessPlatforms"
                type="number"
                value={newAsset.dealerAccessPlatforms}
                onChange={handleChange}
                label="Dealer Access Platforms Number"
                explanation="Enter the number of access platforms for the dealer"
                placeholder={t("createAsset.placeholder.dealerAccessPlatforms")}
              />
              <InputField
                name="dealerCleaningMachines"
                type="number"
                value={newAsset.dealerCleaningMachines}
                onChange={handleChange}
                label="Dealer Cleaning Machines Number" 
                explanation="Enter the number of cleaning machines for the dealer"
                placeholder={t("createAsset.placeholder.dealerCleaningMachines")}
              />
          </>
        )}
        {currentStep === 3 && (
          <>
              <InputField
                name="financialPartner"
                value={newAsset.financialPartner}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.financialPartner")}
                label="Financial Partner" 
                explanation="Enter the financial partner's name"
                maxLength={150}
              />
              <InputField
                name="financialContractClassification"
                value={newAsset.financialContractClassification}
                onChange={handleChange}
                label="Financial Contract Classification" 
                explanation="Enter the classification of the financial contract"
                placeholder={t("createAsset.placeholders.financialContractClassification")}
                maxLength={150}
              />
              <InputField
                name="financialContract"
                value={newAsset.financialContract}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.financialContract")}
                label="Financial Contract" 
                explanation="Enter the financial contract details"
                maxLength={150}
              />
              <InputField
                name="financialContractNo"
                value={newAsset.financialContractNo}
                onChange={handleChange}
                label="Financial Contract No" 
                explanation="Enter the financial contract number"
                placeholder={t("createAsset.placeholder.financialContractNo")}
                maxLength={150}
              />      
              <InputField
                name="uploadFinancialContract"
                type="file"
                onChange={handleChange}
                label="Upload Financial Contract" 
                explanation="Upload the financial contract file"
              />
              <InputField
                name="financialContractStart"
                type="date"
                onChange={handleChange}
                label="Financial Contract Start" 
                explanation="Select the start date of the financial contract"
              />
              <InputField
                name="financialContractEnd"
                type="date"
                onChange={handleChange}
                label="Financial Contract End" 
                explanation="Select the end date of the financial contract"
              />
              <InputField
                name="durationInMonths"
                type="number"
                value={newAsset.durationInMonths}
                onChange={handleChange}
                label="Duration in Months" 
                explanation="Enter the duration of the contract in months"
                placeholder={t("createAsset.placeholder.durationInMonths")}
              />
              <InputField
                name="purchasePrice"
                type="number"
                value={newAsset.purchasePrice}
                onChange={handleChange}
                placeholder="0"
                label="Purchase Price" 
                explanation="Enter the purchase price of the asset"
              />
              <InputField
                name="acquisitionDate"
                type="date"
                onChange={handleChange}
                label="Acquisition Date" 
                explanation="Select the acquisition date of the asset"
              />
              <InputField
                name="residualValueEndOfContract"
                type="number"
                value={newAsset.residualValueEndOfContract}
                onChange={handleChange}
                placeholder="0"
                label="Residual Value End of Contract" 
                explanation="Enter the residual value at the end of the contract"
              />
              <InputField
                name="bookValue"
                value={newAsset.bookValue}
                onChange={handleChange}
                placeholder={t("createAsset.placeholder.bookValue")}
                label="Book Value" 
                explanation="Enter the book value of the asset"
              />
              <InputField
                name="depreciationValue"
                type="number"
                value={newAsset.depreciationValue}
                onChange={handleChange}
                placeholder="0"
                label="Depreciation Value" 
                explanation="Enter the depreciation value of the asset"
              />
              <InputField
                name="acquisitionCosts"
                type="number"
                value={newAsset.acquisitionCosts}
                onChange={handleChange}
                placeholder="0"
                label="Acquisition Costs" 
                explanation="Enter the acquisition costs of the asset"
              />
              <SelectField
                name="depreciationMethod"
                value={newAsset.depreciationMethod}
                onChange={handleChange}
                label="Depreciation Method" 
                explanation="Select the method of depreciation"
                menus={[
                  { value: "", option: "Select Depreciation Method" },
                  { value: "Linear 96 Months", option: "Linear 96 Months" },
                  { value: "0.3% every 12 Months", option: "0.3% every 12 Months" },
                ]}
              />
              <InputField
                name="nextDepreciation"
                type="date"
                onChange={handleChange}
                label="Next Depreciation Date" 
                explanation="Select the next depreciation date"
              />
              <InputField
                name="costRefurbishing"
                type="number"
                value={newAsset.costRefurbishing}
                onChange={handleChange}
                placeholder="0"
                label="Cost of Refurbishing" 
                explanation="Enter the cost of refurbishing the asset"
              />
              <InputField
                name="transportationCost"
                type="number"
                value={newAsset.transportationCost}
                onChange={handleChange}
                placeholder="0"
                label="Transportation Cost" 
                explanation="Enter the transportation cost of the asset"
              />
          </>
        )}
        <div className="button-group">
          {currentStep < steps.length - 1 && (
            <>
              <Button
                variant="primary"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                type="button"
              >
                BACK
              </Button>
              <Button variant="primary" type="button" onClick={handleNextStep}>
                {t("common.next")}
              </Button>
            </>
          )}
          {currentStep === steps.length - 1 && (
            <>
              <Button
                variant="primary"
                type="button"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                BACK
              </Button>
              <Button variant="primary" type="submit">
                UPDATE ASSET
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditAssetPage;
