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
import { getProtected, postProtected } from "../../network/ApiService";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Stepper from "./Stepper/Stepper";
import { useLocation, useNavigate } from "react-router-dom";

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
  yearOfManufacture: "",
  operatingHours: "",
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
  machineLength: "",
  machineWidth: "",
  machineHeight: "",
  basketLoad: "",
  reachHorizontal: "",
  machineWeight: "",
  closedHeight: "",
  freeHeight: "",
  forkCarriage: "",
  forkLength: "",
  loadCentre: "",
  tiresFront: "",
  tiresFront_size: "",
  tiresRear: "",
  tiresRear_size: "",
  twinTires: false,
  addEquipment: [],
  mediaFiles: [],
};

const latestInitialAssets = {
  // Truck basic fields
  platform: "",
  visible: "",
  manufacturer: "",
  year_of_manufacture: "",
  operating_hours: "",
  serial_no: "",
  capacity: "",
  mast_type: "",
  lift_height: "",
  status: "",
  classification: "",
  fem_class: "",
  engine_type: "",
  condition: "",
  title: "",
  description: "",
  description_temp: "",
  available: false,
  location: "",
  salesmen: "",
  currency: "",
  price: "",
  price_netto: "",
  // dealer_price: "",
  price_description: "",
  rental_price_per_day: "",
  rental_price_per_week: "",
  rental_price_per_month: "",
  rental_price_description: "",
  // dealer_id:"",
  // detail_url:"",

  // Truck Description fields

  type: "",
  // media_files:[],
  // price_usd:"",
  // price_netto_usd:"",
  // rental_price_per_day:"",
  // rental_price:"",
  technical_condition: "",
  optical_condition: "",
  machine_length: "",
  machine_width: "",
  machine_height: "",
  machine_weight: "",
  basket_load: "",
  reach_horizontal: "",
  reconditioning_date: "",
  battery: false,
  battery_voltage: "",
  battery_capacity: "",
  battery_case: "",
  battery_category: "",
  battery_charger: true,
  battery_charger_type: "",
  offer_no_dealer: "",
  offer_no_platform: "",
  closed_height: "",
  freihub: false,
  fork_carriage: "",
  free_height: "",
  fork_length: "",
  forks: "",
  load_centre: "",
  tires_front: "",
  tires_front_size: "",
  tires_rear: "",
  tires_rear_size: "",
  additional_equipment: "",
  working_height: "",
  battery_additional_equipment: "",

  // Dealer Information

  dealer_name: "",
  dealer_status: "",
  dealer_contact_information: "",
  dealer_location: "",
  dealer_price: "",
  dealer_price_netto: "",
  dealer_country: "",
  dealer_city: "",
  dealer_zip: "",
  dealer_contact_person: "",
  dealer_address: "",
  dealer_phone: "",
  dealer_website: "",
  dealer_email: "",

  // Finance Information
  finance_partner: "",
  financial_contract_classification: "",
  financial_contract: "",
  financial_contract_no: "",
  upload_financial_contract: "",
  financial_contract_start: "",
  financial_contract_end: "",
  duration_in_months: "",
  purchase_price: "",
  acquisition_date: "",
  residual_value_end_of_contract: "",
  book_value: "",
  depreciation_value: "",
  acquisition_costs: "",
  depreciation_method: "",
  next_depreciation: "",
  cost_refurbishing: "",
  transportation_cost: "",
  customer_name: "",
  customer_no: "",
  customer_contract: "",
  upload_customer_contract: null,
  end_of_contract: null,
  contract_completed: false,

  // battery information
  batteryManufacturer: "",
  batteryChargerType: "",
  batteryModel: "",
  batteryNominalVoltage: "",
  batteryCapacity: "",
  batteryACVoltage: "",
  batteryYearOfManufacturer: "",
  batteryAdditionalEquipment: "",
  batteryLength: "",
  batteryWidth: "",
  batteryWeight: "",
  batteryCasing: "",
  batteryLocation: "",

  //charger specifications

  chargerManufacturer: "",
  chargerType: "",
  chargerModel: "",
  chargerNominalVoltage: "",
  chargerAmp: "",
  chargerACVoltage: "",
  chargerYearOfManufacture: "",
  chargerAdditionalEquipment: "",
  chargerLocation: "",
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
      className="attachment-item d-flex align-items-center p-2 border  mb-2"
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

const CreateAssetPage = ({ show, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const assetData = location.state?.assetData;
  console.log("asset data = > ", assetData);
  // const [newAsset, setNewAsset] = useState(assetData || { ...initialAssets });
  const [newAsset, setNewAsset] = useState(
    assetData || { ...latestInitialAssets }
  );
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
  const [isBatteryAvailable, setIsBatteryAvailable] = useState(false);
  const navigate = useNavigate();
  const [isBatteryChargerAvailable, setIsBatteryChargerAvailable] =
    useState(false);

  const steps = [
    { title: "Asset Basic Information", icon: <FaClipboardList /> },
    {
      // title: t("assets.create.steps.dealerInformation"),
      title: "Asset Financial Information",
      icon: <FaPaperclip />,
    },
    {
      // title: t("assets.create.steps.financialInformation"),
      title: "Contract Information",
      icon: <FaListUl />,
    },
  ];

  const [batterySpecs, setBatterySpecs] = useState({
    manufacturer: "",
    batteryType: "",
    model: "",
    nominalVoltage: "",
    batteryCapacity: "",
    yearOfManufacture: "",
    additionalEquipment: "",
    length: "",
    width: "",
    weight: "",
    casing: "",
    location: "",
  });

  // charger specifications

  // const [chargerSpecifications, setChargerSpecifications] = useState({
  //   batteryManufacturer: "",
  //   batteryChargerType: "",
  //   batteryModel: "",
  //   batteryNominalVoltage: "",
  //   batteryAmp: "",
  //   batteryACVoltage: "",
  //   batteryYearOfManufacturer: "",
  //   batteryAdditionalEquipment: "",
  //   batteryLocation: "",
  // });

  // categories

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

  // Mast types

  const [selectedType, setSelectedType] = useState("None");
  const mastTypes = [
    "None",
    "Standard",
    "Mono",
    "Duplex",
    "Triplex",
    "Quattro",
    "Telescope",
  ];

  const loadCentreOptions = ["Horizontal Reach", "Basket Load"];
  const [selectedLoadCenter, setSelectedLoadCentre] = useState(
    loadCentreOptions[0]
  );

  const engineTypeOptions = ["None", "Electric", "Diesel", "LPG"];
  const [selectedEngineType, setSelectedEngineType] = useState(
    engineTypeOptions[0]
  );

  useEffect(() => {
    console.log("new asset => ", newAsset);
  }, [newAsset]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log("Dealer Id : ", type);
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
      if (name === "available") {
        setMachineAvailable(value);
        console.log("name", name);
        console.log("Value", value);
      } else {
        console.log("Adding new asset payload Latest Initial Assets");
        console.log("name - ", name);

        setNewAsset((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId)
    );
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    console.log("new asset  = ", newAsset);
    console.log("new asset serial number ", newAsset.serial_no);
    if (newAsset.status === "" || newAsset.serial_no === "") {
      toast.error("Please fill out all  mandatory fields");
      return;
    }
    try {
      const formData = new FormData();

      // Add all asset data to formData
      Object.entries(newAsset).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== "attachments") {
          formData.append(key, value.toString());
        }
      });
      console.log("All asset data", newAsset);
      console.log("Asset data", assetData);

      // Add attachments
      attachments.forEach(({ file }) => {
        formData.append("attachments", file);
      });

      // Add documents if needed
      documents.forEach((doc) => {
        formData.append("documents", doc);
      });

      const response = assetData
        ? await postProtected(
            `${API_END_POINTS.updateAssets}/${assetData.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
        : await postProtected(API_END_POINTS.createAssets, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

      if (response) {
        setNewAsset({ ...latestInitialAssets });
        setAttachments([]);
        setDocuments([]);
        setShowMediaUpload(false);
        // onClose(false);
        toast.success(t("assets.create.fields.success"));
        navigate("/dashboard");
      }
    } catch (e) {
      console.error("Error creating/updating asset:", e);
      const message =
        e?.response?.data?.error ||
        e?.response?.data?.attachments?.[0]?.non_field_errors?.[0] ||
        e?.response?.data?.messages?.[0]?.message;
      toast.error(message || t("assets.create.fields.error"));
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
    console.log("selected platform", value);
    setNewAsset({
      ...newAsset,
      platform: value,
    });

    // Clear custom InputField if a predefined option is selected
    if (value !== "other") {
      setCustomPlatform("");
    }
  };

  const handleVisibleChange = (e) => {
    setSelectedVisibleOption(e.target.value);
    setNewAsset({
      ...newAsset,
      visible: e.target.value,
    });
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
    setNewAsset({
      ...latestInitialAssets,
      asset_id: e.target.value,
    });
  };

  const handleAttachmentChange = (e) => {
    const value = e.target.value;
    setSelectedAttachment(value);

    // Clear custom InputField if a predefined option is selected
    if (value !== "other") {
      setCustomAttachment("");
    }
  };
  const handleEquipmentChange = (e) => {
    const value = e.target.value;

    // If "other" is selected, keep the custom equipment InputField; otherwise, clear it
    if (value === "other") {
      setSelectedEquipment((prev) => [...prev, value]); // Add "other" to selected equipment
    } else {
      setSelectedEquipment(value); // Set selected equipment to the chosen option
      setCustomEquipment(""); // Clear custom equipment InputField
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

  // fxn's for changing state for battery Available

  const handleBatteryAvailable = (event) => {
    const value = event.target.value === "true"; // Convert string to boolean
    setIsBatteryAvailable(value);
    setNewAsset({
      ...newAsset,
      battery: value,
    });
    console.log("Battery Available:", value);
  };
  const handleBatteryChargerAvailable = (event) => {
    const value = event.target.value === "true"; // Convert string to boolean
    setIsBatteryChargerAvailable(value);
    setNewAsset({
      ...newAsset,
      battery_charger: value,
    });
    console.log("Battery Charger Available:", value);
  };
  const InputWithExplanation = ({ label, explanation, children }) => {
    return (
      <div className="form-group">
        <div className="field-label-container">
          <label>{label}</label>
          <div className="explanation-icon">
            <i className="fas fa-info-circle" />
            <div className="explanation-tooltip">{explanation}</div>
          </div>
        </div>
        {children}
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

  const Step = ({ step, index, currentStep, steps, handleStepClick }) => {
    return (
      <div
        className={`border-2 border-black flex flex-col items-center mx-1 sm:mx-2 md:mx-9 ${
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
          className={`flex border-2 border-black  items-center justify-center  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 cursor-pointer transition-colors duration-300 ${
            currentStep >= index
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {step.icon}
        </div>

        {index < steps.length - 1 && (
          <div className="hidden sm:block h-1 w-16 md:w-24 lg:w-32 bg-gray-200 mt-4">
            <div
              className={`h-full ${
                currentStep > index ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          </div>
        )}

        <div
          className={`mt-2 text-xs sm:text-sm md:text-base text-center transition-colors duration-300 ${
            currentStep === index
              ? "font-bold text-black"
              : "font-normal text-gray-500"
          }`}
        >
          {step.title}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto  w-full min-h-screen bg-gray-100 pt-20 ">
      <h1 className="px-4 py-2  font-medium text-3xl ">Create Asset</h1>
      <ButtonList />
      <div className="w-full  px-4 py-2  ">
        <div className="flex flex-row justify-between items-start  w-full shadow-sm ">
          {steps.map((step, index) => (
            <div
              className="relative border-2 border-gray-200 bg-white p-2  flex flex-col items-center flex-1"
              key={step.id}
            >
              {/* Step circle */}
              <div
                className={`flex items-center justify-center rounded-full border-2 ${
                  currentStep >= index
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                } w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-blue-500  z-10 cursor-pointer transition-colors duration-300`}
                onClick={() => handleStepClick(index)}
              >
                {step.icon}
              </div>

              {/* Step title */}
              <div className="mt-2 text-center">
                <div
                  className={`text-xs sm:text-sm md:text-base font-medium ${
                    currentStep === index
                      ? "text-blue-500 font-bold"
                      : currentStep > index
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector line */}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreateAsset} className="w-full px-4 py-1 ">
        {currentStep === 0 && (
          <>
            {/* Truck basic information */}

            <div className="w-full flex flex-col gap-4 ">
              {/* Basic Information */}
              <div className="bg-white p-4 shadow-md  ">
                <h2 className="text-xl font-medium mb-3  text-gray-800 ">
                  Asset
                </h2>
                <div className="grid grid-cols-1  sm:grid-cols-2 gap-2 ">
                  {/* Row 1: Manufacturer and Serial Number */}

                  <div>
                    <InputField
                      name="manufacturer"
                      value={newAsset.manufacturer}
                      maxLength={100}
                      onChange={handleChange}
                      label={t("assets.fields.manufacturer")}
                      explanation={t("assets.fields.explanation.manufacturer")}
                      placeholder={t(
                        "createAsset.placeholder.enterManufacturer"
                      )}
                    />
                  </div>

                  <div>
                    <InputField
                      name="serial_no"
                      value={newAsset.serial_no}
                      onChange={handleChange}
                      placeholder={t(
                        "createAsset.placeholder.enterSerialNumber"
                      )}
                      label={`${t("assets.fields.machineSerialNo")} *`}
                      explanation={t(
                        "assets.fields.explanation.machineSerialNo"
                      )}
                    />
                  </div>

                  {/* Row 2: Engine Type and Classification */}
                  <div className="">
                    <InputField
                      name="type"
                      value={newAsset.type}
                      onChange={handleChange}
                      label={t("assets.fields.type")}
                      explanation={t("assets.fields.explanation.type")}
                      placeholder={t("createAsset.placeholder.enterType")}
                    />
                  </div>

                  <div>
                    <SelectField
                      name="classification"
                      value={newAsset.classification}
                      onChange={handleChange}
                      label={t("assets.fields.classification")}
                      explanation={t(
                        "assets.fields.explanation.classification"
                      )}
                      placeholder={t(
                        "createAsset.placeholder.enterClassification"
                      )}
                      menus={[
                        {
                          value: "",
                          option: t("assets.fields.selectClassification"),
                        },
                        {
                          value: "trailer",
                          option: t("assets.options.trailer"),
                        },
                        {
                          value: "tractor",
                          option: t("assets.options.tractor"),
                        },
                        // All other classification options as in original code
                        {
                          value: "battery",
                          option: t("assets.options.battery"),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Row 3: Status, Country, Zip, and City all in one row */}
                <div className="col-span-2 grid grid-cols-4 gap-2">
                  <div>
                    <SelectField
                      name="status"
                      value={newAsset.status}
                      onChange={handleChange}
                      label={`${t("assets.fields.status")} *`}
                      explanation={t("assets.fields.explanation.status")}
                      placeholder={t("createAsset.placeholder.enterStatus")}
                      menus={[
                        { value: "", option: t("assets.fields.selectStatus") },
                        { value: "Demo", option: t("assets.options.demo") },
                        { value: "Rental", option: t("assets.options.rental") },
                        { value: "New", option: t("assets.options.new") },
                        { value: "Used", option: t("assets.options.used") },
                      ]}
                    />
                  </div>

                  <div>
                    <InputField
                      name="dealer_country"
                      value={newAsset.dealer_country}
                      onChange={handleChange}
                      label="Dealer Country"
                      explanation="Enter the dealer's country"
                      placeholder={t(
                        "createAsset.placeholder.enterDealerCountry"
                      )}
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <InputField
                      name="dealer_zip"
                      value={newAsset.dealer_zip}
                      onChange={handleChange}
                      type="number"
                      label="Dealer Zip Code"
                      explanation="Enter the dealer's zip code"
                      placeholder={t("createAsset.placeholder.enterDealerZip")}
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <InputField
                      name="dealer_city"
                      value={newAsset.dealer_city}
                      onChange={handleChange}
                      label="Dealer City"
                      explanation="Enter the dealer's city"
                      placeholder={t("createAsset.placeholder.enterDealerCity")}
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 shadow-md ">
                <h2 className="text-xl font-medium mb-3  text-gray-800">
                  Asset Details
                </h2>

                {/* Regular fields in 2-column grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2  gap-y-2">
                  <div className=" flex items-center ">
                    <div className="flex flex-col  gap-2  ">
                      <label className="font-medium text-gray-700 min-w-24">
                        Engine Type:
                      </label>
                      <div className="flex items-center flex-wrap gap-2">
                        {engineTypeOptions.map((engine_type) => (
                          <button
                            type="button"
                            key={engine_type}
                            className={`px-4 py-2 -md border transition-colors ${
                              selectedEngineType === engine_type
                                ? "bg-blue-500 hover:bg-blue-600 text-white "
                                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setSelectedEngineType(engine_type);
                              setNewAsset((prev) => {
                                return {
                                  ...prev,
                                  engine_type: engine_type,
                                };
                              });
                            }}
                          >
                            {engine_type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <InputField
                      name="year_of_manufacture"
                      value={newAsset.year_of_manufacture || ""}
                      onChange={handleChange}
                      label={t("assets.fields.yearOfManufacture")}
                      explanation={t(
                        "assets.fields.explanation.yearOfManufacture"
                      )}
                      placeholder={t(
                        "createAsset.placeholder.enterYearOfManufacture"
                      )}
                      type="month"
                    />
                  </div>

                  <div>
                    <InputField
                      name="operating_hours"
                      type="number"
                      value={newAsset.operating_hours}
                      onChange={handleChange}
                      label={t("assets.fields.operatingHours")}
                      explanation={t(
                        "assets.fields.explanation.operatingHours"
                      )}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <InputField
                      name="capacity"
                      type="number"
                      value={newAsset.capacity}
                      onChange={handleChange}
                      label={t("assets.fields.capacity")}
                      explanation={t("assets.fields.explanation.capacity")}
                      placeholder={t("createAsset.placeholder.enterCapacity")}
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="w-full">
                      <SelectField
                        name="additional_equipment"
                        value={selectedEquipment}
                        onChange={handleEquipmentChange}
                        label={t("assets.create.fields.selectEquipment")}
                        explanation="Equipment of the machine"
                        menus={[
                          {
                            value: "",
                            option: t("assets.fields.selectEquipment"),
                          },
                          ...ADD_EQUIPMENT_OPTIONS.map((option) => ({
                            value: option,
                            option: option,
                          })),
                          { value: "other", option: t("assets.fields.other") },
                        ]}
                      />
                      {selectedEquipment === "other" && (
                        <div className="mt-2">
                          <InputField
                            type="text"
                            value={customEquipment}
                            onChange={(e) => setCustomEquipment(e.target.value)}
                            placeholder={t(
                              "createAsset.placeholder.enterCustomEquipment"
                            )}
                            maxLength={100}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="w-full">
                      <SelectField
                        name="condition"
                        value={newAsset.condition}
                        onChange={handleChange}
                        label={t("assets.create.fields.condition")}
                        explanation={t("assets.fields.explanation.condition")}
                        placeholder={t(
                          "createAsset.placeholder.enterCondition"
                        )}
                        menus={[
                          {
                            value: "",
                            option: t("assets.fields.selectCondition"),
                          },
                          {
                            value: "New",
                            option: t("assets.fields.conditions.new"),
                          },
                          {
                            value: "Like New",
                            option: t("assets.fields.conditions.likenew"),
                          },
                          {
                            value: "Very Good",
                            option: t("assets.fields.conditions.verygood"),
                          },
                          {
                            value: "Good",
                            option: t("assets.fields.conditions.good"),
                          },
                          {
                            value: "Normal",
                            option: t("assets.fields.conditions.normal"),
                          },
                          {
                            value: "Poor",
                            option: t("assets.fields.conditions.bad"),
                          },
                          {
                            value: "Very Poor",
                            option: t("assets.fields.conditions.verybad"),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <InputField
                      name="lift_height"
                      type="number"
                      value={newAsset.lift_height || ""}
                      onChange={handleChange}
                      label={t("assets.fields.liftHeight")}
                      explanation={t("assets.fields.explanation.liftHeight")}
                      placeholder={t("createAsset.placeholder.enterLiftHeight")}
                    />
                  </div>

                  <div>
                    <InputField
                      type="number"
                      name="machine_length"
                      value={newAsset.machine_length}
                      onChange={handleChange}
                      label={t("assets.create.fields.machineLength")}
                      explanation="Length of the machine"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <InputField
                      type="number"
                      name="machine_width"
                      value={
                        newAsset.machine_width > 0 && newAsset.machine_width
                      }
                      onChange={handleChange}
                      label={t("assets.create.fields.machineWidth")}
                      explanation="Width of the machine"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <InputField
                      type="number"
                      name="machine_height"
                      value={newAsset.machine_height}
                      onChange={handleChange}
                      label={t("assets.create.fields.machineHeight")}
                      explanation="Height of the machine"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <InputField
                      type="number"
                      name="machine_weight"
                      value={newAsset.machine_weight}
                      onChange={handleChange}
                      label={t("assets.create.fields.machineWeight")}
                      explanation="Weight of the machine"
                      placeholder="0"
                    />
                  </div>

                  {/* <div>
                  <InputField
                    name="working_height"
                    type="number"
                    value={newAsset.working_height}
                    onChange={handleChange}
                    label="Working Height"
                    explanation="Working height of the machine"
                    placeholder={t(
                      "createAsset.placeholder.enterWorkingHeight"
                    )}
                  />
                </div> */}

                  {/* <div>
                  <InputField
                    type="number"
                    name="basket_load"
                    value={newAsset.basket_load}
                    onChange={handleChange}
                    label={t("assets.create.fields.basketLoad")}
                    explanation="Basket load of the machine"
                    placeholder="0"
                  />
                </div> */}

                  <div className=" flex mt-3">
                    <div className="flex flex-col  gap-2  ">
                      <label className="font-medium text-gray-700 min-w-24">
                        Load Center:
                      </label>
                      <div className="flex items-center flex-wrap gap-2">
                        {loadCentreOptions.map((load_center) => (
                          <button
                            type="button"
                            key={load_center}
                            className={`px-4 py-2 -md border transition-colors ${
                              selectedLoadCenter === load_center
                                ? "bg-blue-500 hover:bg-blue-600 text-white "
                                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              setSelectedLoadCentre(load_center);
                              setNewAsset((prev) => {
                                return {
                                  ...prev,
                                  load_center: load_center,
                                };
                              });
                            }}
                          >
                            {load_center}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 shadow-md ">
                <h2 className="text-xl font-medium  text-gray-800">Mast</h2>

                <div className="flex flex-col gap-2 my-3  ">
                  <label className="font-medium text-gray-700 min-w-24">
                    Mast Type:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {mastTypes.map((type) => (
                      <button
                        type="button"
                        key={type}
                        className={`px-4 py-2 -md border transition-colors ${
                          selectedType === type
                            ? "bg-blue-500 hover:bg-blue-600 text-white "
                            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setSelectedType(type);
                          setNewAsset((prev) => {
                            return {
                              ...prev,
                              mast_type: type,
                            };
                          });
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm  font-semibold mb-2">Freihub</p>
                  <div className="flex items-center space-x-6">
                    <label className="inline-flex items-center">
                      <input
                        t
                        type="radio"
                        label="Yes"
                        name="freihub"
                        value="true"
                        checked={newAsset.freihub === true}
                        onChange={() => {
                          setNewAsset((prev) => {
                            return {
                              ...prev,
                              freihub: true,
                            };
                          });
                        }}
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="friehub"
                        value="false"
                        checked={newAsset.freihub === false}
                        onChange={() => {
                          setNewAsset((prev) => {
                            return {
                              ...prev,
                              freihub: false,
                            };
                          });
                        }}
                        className="mr-2"
                      />

                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold  text-gray-800">
                    {t("assets.create.sections.forksAndCarriage")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols- lg:grid-cols-3 gap-2 my-2">
                    <div>
                      <InputField
                        name="fork_carriage"
                        type="text"
                        value={newAsset.fork_carriage}
                        onChange={handleChange}
                        maxLength={50}
                        label={t("assets.create.fields.forkCarriage")}
                        explanation="Fork carriage of the machine"
                        placeholder={t(
                          "createAsset.placeholder.enterForkCarriage"
                        )}
                      />
                    </div>

                    <div>
                      <InputField
                        type="number"
                        name="free_height"
                        value={newAsset.free_height}
                        onChange={handleChange}
                        label={t("assets.create.fields.forkHeight")}
                        explanation="Fork height of the machine"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <InputField
                        type="number"
                        name="forks"
                        value={newAsset.forks}
                        onChange={handleChange}
                        label={t("assets.create.fields.forks")}
                        explanation="Forks"
                        placeholder="0"
                      />
                    </div>

                    {/* <div>
                <InputField
                  type="number"
                  name="load_centre"
                  value={newAsset.load_centre}
                  onChange={handleChange}
                  label={t("assets.create.fields.loadCentre")}
                  explanation="Load centre of the machine"
                  placeholder="0"
                />
              </div> */}
                  </div>
                </div>
              </div>

              {/* <div className="">
                <SelectField
                  name="platform"
                  value={selectedPlatform}
                  onChange={handlePlatformChange}
                  label={t("assets.create.fields.platform")}
                  explanation={t("assets.fields.explanation.platform")}
                  placeholder={t("createAsset.placeholder.enterPlatform")}
                  menus={[
                    { value: "", option: t("assets.fields.selectPlatform") },
                    {
                      value: "dealer_search",
                      option: t("assets.options.dealerSearch"),
                    },
                    {
                      value: "customer_search",
                      option: t("assets.options.customerSearch"),
                    },
                    {
                      value: "rental_device",
                      option: t("assets.options.rentalDevice"),
                    },
                    { value: "homepage", option: t("assets.options.homepage") },
                    {
                      value: "manufacturer_page",
                      option: t("assets.options.manufacturerPage"),
                    },
                  ]}
                />
              </div> */}

              {/* <div className="">
                <SelectField
                  name="visible"
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
                    {
                      value: "dealer_search",
                      option: t("assets.options.dealerSearch"),
                    },
                    {
                      value: "customer_search",
                      option: t("assets.options.customerSearch"),
                    },
                    {
                      value: "rental_device",
                      option: t("assets.options.rentalDevice"),
                    },
                    { value: "homepage", option: t("assets.options.homepage") },
                    {
                      value: "manufacturer_page",
                      option: t("assets.options.manufacturerPage"),
                    },
                  ]}
                />
              </div> */}

              {/* Machine Specifications */}

              {/* <div className="">
                <InputField
                  name="year_of_manufacture"
                  value={newAsset.year_of_manufacture || ""}
                  onChange={handleChange}
                  label={t("assets.fields.yearOfManufacture")}
                  explanation={t("assets.fields.explanation.yearOfManufacture")}
                  placeholder={t(
                    "createAsset.placeholder.enterYearOfManufacture"
                  )}
                  type="month"
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="operating_hours"
                  type="number"
                  value={newAsset.operating_hours}
                  onChange={handleChange}
                  label={t("assets.fields.operatingHours")}
                  explanation={t("assets.fields.explanation.operatingHours")}
                  placeholder="0"
                />
              </div> */}

              {/* Identification and Measurements */}

              {/* Classifications and Status */}

              {/* <div className="">
                <SelectField
                  name="fem_class"
                  value={newAsset.fem_class}
                  onChange={handleChange}
                  type="number"
                  label={t("assets.fields.femClass")}
                  explanation={t("assets.fields.explanation.femClass")}
                  placeholder={t("createAsset.placeholder.enterFemClass")}
                  menus={[
                    {
                      value: "",
                      option: t("assets.fields.selectForkliftClass"),
                    },
                    { value: "1", option: "1" },
                    { value: "2", option: "2" },
                    { value: "3", option: "3" },
                    { value: "4", option: "4" },
                    { value: "5", option: "5" },
                  ]}
                />
              </div> */}

              {/* Engine and Condition */}

              {/* <div className="">
                <InputField
                  name="title"
                  value={newAsset.title}
                  onChange={handleChange}
                  label={t("assets.fields.title")}
                  explanation={t("assets.fields.explanation.title")}
                  placeholder={t("createAsset.placeholder.enterTitle")}
                />
              </div> */}

              {/* Descriptions */}
              {/* <div className="">
                <InputField
                  name="description"
                  value={newAsset.description}
                  onChange={handleChange}
                  label={t("assets.fields.description")}
                  explanation={t("assets.fields.explanation.description")}
                  placeholder={t("createAsset.placeholder.enterDescription")}
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="description_temp"
                  value={newAsset.description_temp}
                  onChange={handleChange}
                  label={t("assets.fields.temporaryDescription")}
                  explanation={t(
                    "assets.fields.explanation.temporaryDescription"
                  )}
                  placeholder={t(
                    "createAsset.placeholder.enterTemporaryDescription"
                  )}
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="available"
                  value={machineAvailable}
                  onChange={handleChange}
                  label={t("assets.fields.availableFrom")}
                  explanation={t("assets.fields.explanation.availableFrom")}
                  placeholder={t("createAsset.placeholder.enterAvailableFrom")}
                  maxLength={100}
                />
              </div> */}

              {/* Location and Sales */}
              {/* <div className="">
                <InputField
                  name="location"
                  value={newAsset.location}
                  onChange={handleChange}
                  label={t("assets.fields.currentLocation")}
                  explanation={t("assets.fields.explanation.currentLocation")}
                  placeholder={t(
                    "createAsset.placeholder.enterCurrentLocation"
                  )}
                />
              </div> */}

              {/* <div className="">
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
              </div> */}

              {/* <div className="">
                <SelectField
                  name="currency"
                  value={newAsset.currency}
                  onChange={handleChange}
                  label={t("assets.fields.currency")}
                  explanation={t("assets.fields.explanation.currency")}
                  placeholder={t("createAsset.placeholder.enterCurrency")}
                  menus={[
                    {
                      value: "",
                      option: t("assets.fields.selectCurrencyType"),
                    },
                    { value: "USD", option: t("assets.options.eur") },
                    { value: "EUR", option: t("assets.options.usd") },
                    { value: "GBP", option: t("assets.options.gbp") },
                  ]}
                />
              </div> */}

              {/* Pricing */}
              {/* <div className="">
                <InputField
                  name="price"
                  type="number"
                  value={newAsset.price}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      price: e.target.value,
                    })
                  }
                  label={t("assets.fields.priceNew")}
                  explanation={t("assets.fields.explanation.priceNew")}
                  placeholder={t("createAsset.placeholder.priceNew")}
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="price_netto"
                  type="number"
                  value={newAsset.price_netto}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      price_netto: e.target.value,
                    })
                  }
                  label={t("assets.fields.priceNetto")}
                  explanation={t("assets.fields.explanation.priceNetto")}
                  placeholder={t("createAsset.placeholder.entePriceNetto")}
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="price_description"
                  value={newAsset.price_description}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      price_description: e.target.value.split(", "),
                    })
                  }
                  label={t("assets.fields.priceDescription")}
                  explanation={t("assets.fields.explanation.priceDescription")}
                  placeholder={t(
                    "createAsset.placeholder.enterPriceDescription"
                  )}
                />
              </div> */}

              {/* Rental Pricing */}
              {/* <div className="">
                <InputField
                  name="rental_price_per_day"
                  type="number"
                  value={newAsset.rental_price_per_day}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      rental_price_per_day: e.target.value,
                    })
                  }
                  label={t("assets.fields.rentalPricePerDay")}
                  explanation={t("assets.fields.explanation.rentalPricePerDay")}
                  placeholder={t(
                    "createAsset.placeholder.enterRentalPricePerDay"
                  )}
                />
              </div> */}

              {/* <div className="">
                <InputField
                  name="rental_price_per_week"
                  type="number"
                  value={newAsset.rental_price_per_week}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      rental_price_per_week: e.target.value,
                    })
                  }
                  label={t("assets.fields.rentalPricePerWeek")}
                  explanation={t(
                    "assets.fields.explanation.rentalPricePerWeek"
                  )}
                  placeholder={t(
                    "createAsset.placeholder.enterRentalPricePerWeek"
                  )}
                />
              </div> */}
              {/* 
              <div className="">
                <InputField
                  name="rental_price_per_month"
                  type="number"
                  value={newAsset.rental_price_per_month}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      rental_price_per_month: e.target.value,
                    })
                  }
                  label={t("assets.fields.rentalPricePerMonth")}
                  explanation={t(
                    "assets.fields.explanation.rentalPricePerMonth"
                  )}
                  placeholder={t(
                    "createAsset.placeholder.enterRentalPricePerMonth"
                  )}
                />
              </div> */}

              {/* Rental Description (spans full width on medium screens and up) */}
              {/* <div className=" md:col-span-2 lg:col-span-3">
                <InputField
                  name="rental_price_description"
                  value={newAsset.rental_price_description}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      rental_price_description: e.target.value.split(", "),
                    })
                  }
                  label={t("assets.fields.rentalPriceDescription")}
                  explanation={t(
                    "assets.fields.explanation.rentalPriceDescription"
                  )}
                  placeholder={t(
                    "createAsset.placeholder.enterRentalPriceDescription"
                  )}
                />
              </div> */}

              <div className="bg-white p-4 shadow-md">
                <h2 className="text-xl font-medium mb-3  text-gray-800">
                  Battery and Charger
                </h2>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col">
                      <InputField
                        //  label={t("assets.fields.availableFrom")}
                        label={"Manufacturer"}
                        explanation={t(
                          "assets.fields.explanation.availableFrom"
                        )}
                        //  placeholder={t("createAsset.placeholder.enterAvailableFrom")}
                        placeholder="Enter Manufacturer"
                        maxLength={100}
                        name="batteryManufacturer"
                        value={newAsset.batteryManufacturer}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter battery type"
                        label="Battery Type"
                        explanation="Type of the battery"
                        type="text"
                        name="batteryChargerType"
                        value={newAsset.batteryChargerType}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter battery model"
                        label="Model"
                        explanation="Model of the battery"
                        type="text"
                        name="batteryModel"
                        value={newAsset.batteryModel}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter nominal voltage"
                        label="Nominal Voltage (V)"
                        explanation="Nominal voltage of the battery"
                        type="text"
                        name="batteryNominalVoltage"
                        value={newAsset.batteryNominalVoltage}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter battery capacity"
                        label="Battery Capacity (Ah)"
                        explanation="Battery capacity in Ampere hours"
                        type="text"
                        name="batteryCapacity"
                        value={newAsset.batteryCapacity}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter year of manufacture"
                        label="Year Of Manufacture"
                        explanation="Year of manufacture of the battery"
                        type="month"
                        name="batteryYearOfManufacturer"
                        value={newAsset.batteryYearOfManufacturer}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Additional Equipment
                      </label>
                      <textarea
                        name="batteryAdditionalEquipment"
                        value={newAsset.batteryAdditionalEquipment}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                        rows="2"
                        placeholder="Enter additional equipment"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter Length"
                        label="Length (mm)"
                        explanation="Length of the battery in millimeters"
                        type="text"
                        name="batteryLength"
                        value={newAsset.batteryLength}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter width"
                        label="Width (mm)"
                        explanation="Width of the battery in millimeters"
                        type="text"
                        name="batteryWidth"
                        value={newAsset.batteryWidth}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    <div className="flex flex-col">
                      <InputField
                        placeholder="Enter weight"
                        label="Weight (kg)"
                        explanation="Weight of the battery in kilograms"
                        type="text"
                        name="batteryWeight"
                        value={newAsset.batteryWeight}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                    <div className="flex flex-col">
                      <InputField
                        label="Battery Casing"
                        placeholder="Type of battery casing"
                        type="text"
                        name="batteryCasing"
                        value={newAsset.batteryCasing}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-col">
                      <InputField
                        label="Location"
                        explanation="Location of the battery in the machine"
                        type="text"
                        name="batteryLocation"
                        value={newAsset.batteryLocation}
                        onChange={handleChange}
                        placeholder="Enter location"
                        className="p-2 border border-gray-300 gap-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 shadow-md">
                <h2 className="text-xl font-medium mb-3  text-gray-800">
                  Charger Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 ">
                  {/* Manufacturer */}
                  <div className="flex flex-col">
                    <InputField
                      label="Manufacturer"
                      explanation="Manufacturer of the charger"
                      placeholder="Enter Manufacturer"
                      type="text"
                      name="chargerManufacturer"
                      value={newAsset.chargerManufacturer}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Charger Type */}
                  <div className="flex flex-col">
                    <div className="">
                      <InputField
                        label="Charger Type"
                        explanation="Type of the charger"
                        placeholder="Enter charger type"
                        type="text"
                        name="chargerType"
                        value={newAsset.chargerType}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="flex flex-col">
                    <InputField
                      label="Model"
                      explanation="Model of the charger"
                      placeholder="Enter Model"
                      type="text"
                      name="chargerModel"
                      value={newAsset.chargerModel}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nominal Voltage */}
                  <div className="flex flex-col">
                    <InputField
                      label="Nominal Voltage (V)"
                      explanation="Nominal voltage of the charger"
                      placeholder="Enter Nominal Voltage"
                      type="text"
                      name="chargerNominalVoltage"
                      value={newAsset.chargerNominalVoltage}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Amp */}
                  <div className="flex flex-col">
                    <InputField
                      label="Charger Amp (A)"
                      explanation="Ampere rating of the charger"
                      placeholder="Enter Charger Ampere"
                      type="text"
                      name="chargerAmp"
                      value={newAsset.chargerAmp}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* AC Voltage */}
                  <div className="flex flex-col">
                    <InputField
                      label="Charger AC Voltage (V)"
                      explanation="AC voltage of the charger"
                      placeholder="Enter Charger AC Voltage"
                      type="text"
                      name="chargerACVoltage"
                      value={newAsset.chargerACVoltage}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Year of Manufacture */}
                  <div className="flex flex-col">
                    <InputField
                      label="Year Of Manufacture"
                      explanation="Year of manufacture of the charger"
                      placeholder="Enter Year Of Manufacture"
                      type="month"
                      name="chargerYearOfManufacture"
                      value={newAsset.chargerYearOfManufacture}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Additional Equipment */}
                  <div className="flex flex-col">
                    <InputField
                      label="Additional Equipment"
                      explanation="Additional equipment of the charger"
                      placeholder="Enter additional equipment"
                      type="text"
                      name="chargerAdditionalEquipment"
                      value={newAsset.chargerAdditionalEquipment}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="flex flex-col md:col-span-2">
                    <InputField
                      label="Location"
                      explanation="Location of the charger in the machine"
                      placeholder="Enter Location"
                      type="text"
                      name="chargerLocation"
                      value={newAsset.chargerLocation}
                      onChange={handleChange}
                      className="px-4 py-2 border border-gray-300 gap-2-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 shadow-md">
                <h3 className="text-lg font-semibold  text-gray-800">
                  {t("assets.create.sections.tires")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                  <div>
                    <SelectField
                      name="tires_front"
                      value={newAsset.tires_front}
                      onChange={handleChange}
                      label={t("assets.create.fields.tiresFront")}
                      explanation="Front tires of the machine"
                      menus={[
                        {
                          value: "bandages",
                          option: t("assets.options.bandages"),
                        },
                        {
                          value: "pneumatic",
                          option: t("assets.options.pneumatic"),
                        },
                        {
                          value: "polyurethane",
                          option: t("assets.options.polyurethane"),
                        },
                        {
                          value: "solid_rubber",
                          option: t("assets.options.solid-rubber"),
                        },
                        {
                          value: "super_elastic",
                          option: t("assets.options.super-elastic"),
                        },
                      ]}
                    />
                  </div>

                  <div>
                    <InputField
                      name="tires_front_size"
                      type="number"
                      value={newAsset.tires_front_size}
                      onChange={handleChange}
                      maxLength={50}
                      label={t("assets.create.fields.tiresFrontSize")}
                      explanation="Front tires size of the machine"
                      placeholder={t(
                        "createAsset.placeholder.enterTiresFrontSize"
                      )}
                    />
                  </div>

                  <div>
                    <InputField
                      name="tires_rear_size"
                      type="number"
                      value={newAsset.tires_rear_size}
                      onChange={handleChange}
                      maxLength={50}
                      label={t("assets.create.fields.tiresRearSize")}
                      explanation="Rear tires size of the machine"
                      placeholder={t(
                        "createAsset.placeholder.enterTiresRearSize"
                      )}
                    />
                  </div>

                  <div>
                    <SelectField
                      name="tires_rear"
                      value={newAsset.tires_rear}
                      onChange={handleChange}
                      // label={t("assets.create.fields.selectTireType")}
                      label="Rear Tier type"
                      explanation="Select Rear Tire Type"
                      menus={[
                        {
                          value: "bandages",
                          option: t("assets.options.bandages"),
                        },
                        {
                          value: "pneumatic",
                          option: t("assets.options.pneumatic"),
                        },
                        {
                          value: "polyurethane",
                          option: t("assets.options.polyurethane"),
                        },
                        {
                          value: "solid_rubber",
                          option: t("assets.options.solid-rubber"),
                        },
                        {
                          value: "super_elastic",
                          option: t("assets.options.super-elastic"),
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 shadow-md">
                <h2 className="text-xl font-medium mb-3  text-gray-800">
                  Media
                </h2>

                <div className="mb-4">
                  <InputField
                    name="upload_financial_contract"
                    type="file"
                    onChange={handleChange}
                    label="Upload Financial Contract"
                    explanation="Upload the financial contract file"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {currentStep === 1 && (
          <>
            {/* Truck Description Form  */}
            <h3>Asset/Asset</h3>
            {/* <h4>{t("assets.create.sections.technicalCondition")}</h4> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <SelectField
                  name="technical_condition"
                  value={newAsset.technical_condition}
                  onChange={handleChange}
                  label={t("assets.create.fields.technicalCondition")}
                  explanation={t(
                    "assets.fields.explanation.technicalCondition"
                  )}
                  placeholder={t("createAsset.placeholder.enterCondition")}
                  menus={[
                    { value: "", option: t("assets.fields.selectCondition") },
                    { value: "new", option: t("assets.fields.conditions.new") },
                    {
                      value: "like_new",
                      option: t("assets.fields.conditions.likenew"),
                    },
                    {
                      value: "very_good",
                      option: t("assets.fields.conditions.verygood"),
                    },
                    {
                      value: "good",
                      option: t("assets.fields.conditions.good"),
                    },
                    {
                      value: "normal",
                      option: t("assets.fields.conditions.normal"),
                    },
                    {
                      value: "poor",
                      option: t("assets.fields.conditions.poor"),
                    },
                    {
                      value: "very_poor",
                      option: t("assets.fields.conditions.verypoor"),
                    },
                  ]}
                />
              </div>

              <div>
                <SelectField
                  name="optical_condition"
                  value={newAsset.optical_condition}
                  onChange={handleChange}
                  label={t("assets.create.fields.opticialCondition")}
                  explanation={t("assets.fields.explanation.opticalCondition")}
                  placeholder={t(
                    "createAsset.placeholder.enterOpticalCondition"
                  )}
                  menus={[
                    { value: "", option: t("assets.fields.selectCondition") },
                    {
                      value: "new",
                      option: t("assets.fields.opticalConditions.1"),
                    },
                    {
                      value: "2",
                      option: t("assets.fields.opticalConditions.2"),
                    },
                    {
                      value: "3",
                      option: t("assets.fields.opticalConditions.3"),
                    },
                    {
                      value: "4",
                      option: t("assets.fields.opticalConditions.4"),
                    },
                    {
                      value: "5",
                      option: t("assets.fields.opticalConditions.5"),
                    },
                    {
                      value: "6",
                      option: t("assets.fields.opticalConditions.6"),
                    },
                  ]}
                />
              </div>

              <div>
                <InputField
                  name="reconditioning_date"
                  type="date"
                  value={newAsset.reconditioning_date || ""}
                  onChange={handleChange}
                  label="Reconditioning Date"
                  explanation="Reconditioning date of the machine"
                />
              </div>
            </div>

            {/* Offer Numbers */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold  text-gray-800">
                Offer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <InputField
                    name="offer_no_dealer"
                    type="text"
                    value={newAsset.offer_no_dealer}
                    onChange={handleChange}
                    label="Offer Number Dealer"
                    explanation="Offer No. Dealer"
                    placeholder="Enter Offer Number Dealer"
                  />
                </div>

                <div>
                  <InputField
                    name="offer_no_platform"
                    type="text"
                    value={newAsset.offer_no_platform}
                    onChange={handleChange}
                    label="Offer Number Platform"
                    explanation="Offer No. Platform"
                    placeholder="Enter Offer Number Platform"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}

            {/* Performance Specifications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold  text-gray-800">
                Performance Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <InputField
                    type="number"
                    name="reach_horizontal"
                    value={newAsset.reach_horizontal}
                    onChange={handleChange}
                    label={t("assets.create.fields.reachHorizontal")}
                    explanation="Vertical reach of the machine"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Battery Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold  text-gray-800">
                Battery Information
              </h3>
              <div className="">
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  Battery Available
                </p>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center">
                    <InputField
                      type="radio"
                      name="battery"
                      value="true"
                      checked={isBatteryAvailable === true}
                      onChange={handleBatteryAvailable}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <InputField
                      type="radio"
                      name="battery"
                      value="false"
                      checked={isBatteryAvailable === false}
                      onChange={handleBatteryAvailable}
                      className="mr-2"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {isBatteryAvailable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <InputField
                      name="battery_voltage"
                      type="number"
                      value={newAsset.battery_voltage}
                      onChange={handleChange}
                      label="Battery Voltage"
                      explanation="Voltage of the battery"
                      placeholder={t(
                        "createAsset.placeholder.enterBatteryVoltage"
                      )}
                    />
                  </div>
                  <div>
                    <InputField
                      name="battery_capacity"
                      type="number"
                      value={newAsset.battery_capacity}
                      onChange={handleChange}
                      label="Battery Capacity"
                      explanation="Capacity of the battery in Ah"
                      placeholder={t(
                        "createAsset.placeholder.enterBatteryCapacity"
                      )}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <InputField
                      name="battery_case"
                      type="number"
                      value={newAsset.battery_case}
                      onChange={handleChange}
                      label="Battery Case"
                      explanation="Battery Case"
                      placeholder={t(
                        "createAsset.placeholder.enterBatteryCase"
                      )}
                    />
                  </div>
                  <div>
                    <SelectField
                      name="battery_category"
                      value={newAsset.battery_category}
                      onChange={handleChange}
                      label="Battery Category"
                      explanation="Category of the battery"
                      menus={[
                        { value: "", option: "Select Battery Category" },
                        { value: "PzS", option: t("assets.options.pzs") },
                        { value: "Gel", option: t("assets.options.gel") },
                        {
                          value: "Lithium-Ion",
                          option: t("assets.options.lithium-ion"),
                        },
                        {
                          value: "Starter",
                          option: t("assets.options.starter"),
                        },
                        {
                          value: "Waterless",
                          option: t("assets.options.waterless"),
                        },
                        {
                          value: "Lead Acid",
                          option: t("assets.options.lead-acid"),
                        },
                      ]}
                    />
                  </div>
                  <div>
                    <InputField
                      name="battery_additional_equipment"
                      type="text"
                      value={newAsset.battery_additional_equipment}
                      onChange={handleChange}
                      label="Battery Add Equipment"
                      explanation="Additional equipment for the battery"
                      placeholder={t(
                        "createAsset.placeholder.enterAdditionalEquipment"
                      )}
                      maxLength={150}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 ">
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  Battery Charger Available
                </p>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center">
                    <InputField
                      type="radio"
                      name="battery_charger"
                      value="true"
                      checked={isBatteryChargerAvailable === true}
                      onChange={handleBatteryChargerAvailable}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <InputField
                      type="radio"
                      name="battery_charger"
                      value="false"
                      checked={isBatteryChargerAvailable === false}
                      onChange={handleBatteryChargerAvailable}
                      className="mr-2"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {isBatteryChargerAvailable && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <SelectField
                      name="battery_charger_type"
                      value={newAsset.battery_charger_type}
                      onChange={handleChange}
                      label="Battery Charger Type"
                      explanation="Charger of the battery"
                      menus={[
                        {
                          value: "Single-phase",
                          option: t("assets.options.single-phase"),
                        },
                        {
                          value: "Three-phase",
                          option: t("assets.options.three-phase"),
                        },
                        { value: "HF", option: t("assets.options.hf") },
                        {
                          value: "Integrated",
                          option: t("assets.options.integrated"),
                        },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Forks and Carriage Section */}

            {/* Tires Section */}

            {/* Additional Equipment */}
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Dealer Basic Info */}
              <div className="space-y-4">
                <InputField
                  name="dealer_name"
                  value={newAsset.dealer_name}
                  onChange={handleChange}
                  placeholder={t("createAsset.placeholder.enterDealerName")}
                  label="Dealer"
                  explanation="Enter the dealer name"
                  maxLength={150}
                />

                <InputField
                  name="dealer_status"
                  value={newAsset.dealer_status}
                  onChange={handleChange}
                  label="Dealer Status"
                  explanation="Enter the dealer status"
                  placeholder={t("createAsset.placeholder.enterDealerStatus")}
                  maxLength={150}
                />

                <InputField
                  name="dealer_contact_information"
                  value={newAsset.dealer_contact_information}
                  onChange={handleChange}
                  label="Dealer Contact Information"
                  explanation="Enter the dealer contact information"
                  placeholder={t(
                    "createAsset.placeholder.enterContactInformation"
                  )}
                  maxLength={150}
                />
              </div>

              {/* Dealer Location */}

              {/* Dealer Address */}
              <div className="space-y-4">
                <InputField
                  name="dealer_location"
                  value={newAsset.dealer_location}
                  onChange={handleChange}
                  label="Dealer Location"
                  explanation="Enter the dealer location"
                  placeholder={t("createAsset.placeholder.enterDealerLocation")}
                  maxLength={150}
                />

                <InputField
                  name="dealer_address"
                  value={newAsset.dealer_address}
                  onChange={handleChange}
                  label="Dealer Address"
                  explanation="Enter the dealer address"
                  placeholder={t(
                    "createAsset.placeholder.enterDealerContactOwner"
                  )}
                  maxLength={50}
                />
              </div>
            </div>
          </>
        )}
        {currentStep === 3 && (
          <>
            {/* Finance Information form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <InputField
                  name="finance_partner"
                  value={newAsset.finance_partner}
                  onChange={handleChange}
                  placeholder={t(
                    "createAsset.placeholder.enterFinancialPartner"
                  )}
                  label="Financial Partner"
                  explanation="Enter the financial partner's name"
                  maxLength={150}
                />
              </div>
              <div>
                <InputField
                  name="financial_contract_classification"
                  value={newAsset.financial_contract_classification}
                  onChange={handleChange}
                  label="Financial Contract Classification"
                  explanation="Enter the classification of the financial contract"
                  placeholder={t(
                    "createAsset.placeholder.enterFinancialContractClassification"
                  )}
                  maxLength={150}
                />
              </div>
              <div>
                <InputField
                  name="end_of_contract"
                  type="date"
                  value={newAsset.end_of_contract}
                  onChange={handleChange}
                  placeholder="Enter end of contract"
                  label="Enter end of contract"
                  explanation="End of contract"
                />
              </div>
              <div>
                <InputField
                  name="financial_contract"
                  value={newAsset.financial_contract}
                  onChange={handleChange}
                  placeholder={t(
                    "createAsset.placeholder.enterFinancialContract"
                  )}
                  label="Financial Contract"
                  explanation="Enter the financial contract details"
                  maxLength={150}
                />
              </div>
              <div>
                <InputField
                  name="financial_contract_no"
                  value={newAsset.financial_contract_no}
                  onChange={handleChange}
                  label="Financial Contract No"
                  explanation="Enter the financial contract number"
                  placeholder={t(
                    "createAsset.placeholder.enterFinancialContractNo"
                  )}
                  maxLength={150}
                />
              </div>
              <div>
                <InputField
                  name="upload_financial_contract"
                  type="file"
                  onChange={handleChange}
                  label="Upload Financial Contract"
                  explanation="Upload the financial contract file"
                />
              </div>
            </div>

            {/* Contract Duration Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Contract Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <InputField
                    name="financial_contract_start"
                    type="date"
                    onChange={handleChange}
                    label="Financial Contract Start"
                    explanation="Select the start date of the financial contract"
                  />
                </div>
                <div>
                  <InputField
                    name="financial_contract_end"
                    type="date"
                    onChange={handleChange}
                    label="Financial Contract End"
                    explanation="Select the end date of the financial contract"
                  />
                </div>
                <div>
                  <InputField
                    name="duration_in_months"
                    type="number"
                    value={newAsset.duration_in_months}
                    onChange={handleChange}
                    label="Duration in Months"
                    explanation="Enter the duration of the contract in months"
                    placeholder={t(
                      "createAsset.placeholder.enterDurationInMonths"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Asset Valuation Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Asset Valuation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <InputField
                    name="purchase_price"
                    type="number"
                    value={newAsset.purchase_price}
                    onChange={handleChange}
                    placeholder="0"
                    label="Purchase Price"
                    explanation="Enter the purchase price of the asset"
                  />
                </div>
                <div>
                  <InputField
                    name="acquisition_date"
                    type="date"
                    onChange={handleChange}
                    label="Acquisition Date"
                    explanation="Select the acquisition date of the asset"
                  />
                </div>
                <div>
                  <InputField
                    name="residual_value_end_of_contract"
                    type="number"
                    value={newAsset.residual_value_end_of_contract}
                    onChange={handleChange}
                    placeholder="0"
                    label="Residual Value End of Contract"
                    explanation="Enter the residual value at the end of the contract"
                  />
                </div>
                <div>
                  <InputField
                    name="book_value"
                    type="number"
                    value={newAsset.book_value}
                    onChange={handleChange}
                    placeholder={t("createAsset.placeholder.enterBookValue")}
                    label="Book Value"
                    explanation="Enter the book value of the asset"
                  />
                </div>
                <div>
                  <InputField
                    name="depreciation_value"
                    type="number"
                    value={newAsset.depreciation_value}
                    onChange={handleChange}
                    placeholder="0"
                    label="Depreciation Value"
                    explanation="Enter the depreciation value of the asset"
                  />
                </div>
                <div>
                  <InputField
                    name="acquisition_costs"
                    type="number"
                    value={newAsset.acquisition_costs}
                    onChange={handleChange}
                    placeholder="0"
                    label="Acquisition Costs"
                    explanation="Enter the acquisition costs of the asset"
                  />
                </div>
              </div>
            </div>

            {/* Depreciation Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Depreciation Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <SelectField
                    name="depreciation_method"
                    value={newAsset.depreciation_method}
                    onChange={handleChange}
                    label="Depreciation Method"
                    explanation="Select the method of depreciation"
                    menus={[
                      { value: "", option: "Select Depreciation Method" },
                      { value: "Linear 96 Months", option: "Linear 96 Months" },
                      {
                        value: "0.3% every 12 Months",
                        option: "0.3% every 12 Months",
                      },
                    ]}
                  />
                </div>
                <div>
                  <InputField
                    name="next_depreciation"
                    type="date"
                    onChange={handleChange}
                    label="Next Depreciation Date"
                    explanation="Select the next depreciation date"
                  />
                </div>
                <div>
                  <InputField
                    name="cost_refurbishing"
                    type="number"
                    value={newAsset.cost_refurbishing}
                    onChange={handleChange}
                    placeholder="0"
                    label="Cost of Refurbishing"
                    explanation="Enter the cost of refurbishing the asset"
                  />
                </div>
                <div>
                  <InputField
                    name="transportation_cost"
                    type="number"
                    value={newAsset.transportation_cost}
                    onChange={handleChange}
                    placeholder="0"
                    label="Transportation Cost"
                    explanation="Enter the transportation cost of the asset"
                  />
                </div>
              </div>
            </div>

            {/* Customer Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <InputField
                    name="customer_name"
                    type="text"
                    maxLength={150}
                    value={newAsset.customer_name}
                    onChange={handleChange}
                    placeholder="Enter the customer name"
                    label="Customer name"
                    explanation="Enter the customer name"
                  />
                </div>
                <div>
                  <InputField
                    name="customer_no"
                    type="number"
                    maxLength={50}
                    value={newAsset.customer_no}
                    onChange={handleChange}
                    placeholder="Enter the customer no."
                    label="Customer no"
                    explanation="Enter the customer no."
                  />
                </div>
                <div>
                  <InputField
                    name="customer_contract"
                    type="text"
                    maxLength={100}
                    value={newAsset.customer_contract}
                    onChange={handleChange}
                    placeholder="Enter the customer contract"
                    label="Customer contract"
                    explanation="Enter the customer contract"
                  />
                </div>
                <div>
                  <InputField
                    name="upload_customer_contract"
                    type="file"
                    onChange={handleChange}
                    placeholder="Upload customer contract"
                    label="Upload customer contract"
                    explanation="Upload customer contract"
                  />
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start items-center my-4">
          {currentStep < steps.length - 1 && (
            <>
              {currentStep !== 0 ? (
                <button
                  variant="primary"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 0}
                  type="button"
                  className="bg-gray-200  text-black px-4 py-2 -md text-sm sm:text-base w-full sm:w-auto"
                >
                  BACK
                </button>
              ) : (
                <button
                  type="button"
                  variant="close"
                  onClick={() => navigate("/dashboard")}
                  className="bg-gray-200  text-black px-4 py-2 -md text-sm sm:text-base w-full sm:w-auto"
                >
                  {t("warehouse.cancelButton")}
                </button>
              )}

              <button
                variant="primary"
                type="submit"
                // onClick={handleCreateAsset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 -md text-sm sm:text-base w-full sm:w-auto"
              >
                Create
              </button>
            </>
          )}

          {currentStep === steps.length - 1 && (
            <>
              <button
                variant="primary"
                type="button"
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                className="bg-gray-200  text-black px-4 py-2 -md text-sm sm:text-base w-full sm:w-auto"
              >
                BACK
              </button>

              <button
                variant="primary"
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 -md text-sm sm:text-base w-full sm:w-auto"
              >
                CREATE ASSET
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateAssetPage;
