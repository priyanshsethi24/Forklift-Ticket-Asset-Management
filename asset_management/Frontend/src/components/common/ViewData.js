import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getProtected } from "../../network/ApiService";
import { API_END_POINTS } from "../../network/apiEndPoint";

const ViewData = (props) => {
  const { id, setViewAssetId } = props;
  const { t } = useTranslation();
  const { currentLanguages } = useSelector((state) => state.language);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Define your base URL for media files
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    if (id) {
      handleViewAsset(id);
      fetchAttachments(id);
    }
  }, [id, currentLanguages]);

  const handleViewAsset = async (id) => {
    setShowModal(true);
    setLoading(true);

    try {
      // Add language parameter to the query
      const query = `language=${currentLanguages}`;
      const response = await getProtected(
        `${API_END_POINTS.assets}${id}/?${query}`
      );

      if (response && !response.error) {
        setSelectedAsset(response);
      } else {
        throw new Error(response.error || "Failed to fetch asset");
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
      alert(t("viewAsset.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async (id) => {
    try {
      // Add language parameter to attachments query as well
      const query = `language=${currentLanguages}`;
      const response = await getProtected(
        `${API_END_POINTS.assets}${id}/attachments/?${query}`
      );

      if (response && Array.isArray(response)) {
        const processedAttachments = response.map((attachment) => ({
          ...attachment,
          displayUrl: attachment.image_base64
            ? `data:image/jpeg;base64,${attachment.image_base64}`
            : attachment.document_base64
            ? `data:${attachment.content_type || "application/pdf"};base64,${
                attachment.document_base64
              }`
            : null,
        }));
        setAttachments(processedAttachments);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  };

  const getTranslatedFieldName = (key) => {
    return t(
      `assetUpdate.fields.${key}`,
      t(`viewAsset.fields.${key}`, formatKey(key))
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setViewAssetId(null);
    setCurrentAttachment(null);
  };

  return showModal ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4 mt-20 py-10 ">
    <div className="bg-white -lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold truncate">{t("viewAsset.title")}</h2>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
          onClick={closeModal}
          aria-label={t("viewAsset.closeButton")}
        >
          <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      
      <div className="p-3 sm:p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 ">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 rounded-full border-t-transparent -full animate-spin"></div>
            <p className="mt-4 text-gray-600">{t("viewAsset.loading")}</p>
          </div>
        ) : (
          <div>
            {selectedAsset ? (
              <>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xl sm:text-2xl font-bold break-words">
                        Asset Id : {selectedAsset?.id}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-x-1">
                        <span>{selectedAsset?.platform}</span>
                        <span className="hidden xs:inline">|</span>
                        <span>{selectedAsset?.manufacturer}</span>
                        <span className="hidden xs:inline">|</span>
                        <span>{selectedAsset?.model}</span>
                        <span className="hidden xs:inline">|</span>
                        <span>{selectedAsset?.year_of_manufacture}</span>
                        <span className="hidden xs:inline">|</span>
                        <span>{selectedAsset?.classification}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-bold text-blue-600">
                        {selectedAsset?.location}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {selectedAsset?.engine_type}
                      </p>
                    </div>
                  </div>
  
                  <div className="w-full">
                    <img
                      src="/images/truckImage.jpg"
                      alt="Asset truck image"
                      className="w-full object-cover  h-48 sm:h-64"
                    />
                  </div>
  
                  <div className="bg-gray-50 p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {Object.entries(selectedAsset).slice(0, 7).map(([key, value]) => {
                        if (
                          key === "created_at" ||
                          key === "updated_at" ||
                          key === "id" ||
                          key === "attachments"
                        ) {
                          return null;
                        }
                        return (
                          <div key={key} className="flex justify-between border-b border-gray-200 py-2 text-sm sm:text-base">
                            <span className="font-medium mr-2">{getTranslatedFieldName(key)}</span>
                            <span className="text-gray-700 text-right">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="text-center mt-2">
                      <button 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800" 
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        <MdOutlineKeyboardArrowDown 
                          className={`w-5 h-5 sm:w-6 sm:h-6 transform ${isExpanded ? "rotate-180" : ""} transition-transform`}
                        />
                        <span className="ml-1 text-sm sm:text-base">{isExpanded ? "Show Less" : "Show More"}</span>
                      </button>
                    </div>
                    
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[90vh] opacity-100 my-4 overflow-y-auto" : "max-h-0 opacity-0"}`}>
                      {Object.entries(selectedAsset).slice(7).map(([key, value]) => {
                        if (
                          key === "created_at" ||
                          key === "updated_at" ||
                          key === "id" ||
                          key === "attachments"
                        ) {
                          return null;
                        }
                        return (
                          <div key={key} className="flex justify-between border-b border-gray-200 py-2 text-sm sm:text-base ">
                            <span className="font-medium mr-2">{getTranslatedFieldName(key)}</span>
                            <span className="text-gray-700 text-right">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
  
                {attachments.length > 0 && (
                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                      {t("viewAsset.fields.attachments.title")}:
                    </h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {attachments.map((attachment) => (
                        <li key={attachment.id} className="flex flex-col xs:flex-row gap-2 border-b border-gray-200 pb-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 flex-1 text-left text-sm sm:text-base"
                            onClick={() => setCurrentAttachment(attachment)}
                          >
                            {t("viewAsset.fields.attachments.view")}
                            {t("viewAsset.fields.attachments.date", {
                              date: new Date(
                                attachment.uploaded_at
                              ).toLocaleDateString(),
                            })}
                          </button>
  
                          <button
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200  text-gray-700 text-xs sm:text-sm"
                            onClick={() => {
                              try {
                                // Get the appropriate base64 data
                                const base64Data =
                                  attachment.image_base64 ||
                                  attachment.document_base64;
                                if (!base64Data) {
                                  throw new Error("No file data available");
                                }
  
                                // Convert base64 to blob
                                const byteString = atob(base64Data);
                                const ab = new ArrayBuffer(byteString.length);
                                const ia = new Uint8Array(ab);
  
                                for (let i = 0; i < byteString.length; i++) {
                                  ia[i] = byteString.charCodeAt(i);
                                }
  
                                // Determine the correct MIME type
                                const mimeType = attachment.image_base64
                                  ? "image/jpeg"
                                  : attachment.content_type ||
                                    "application/octet-stream";
  
                                const blob = new Blob([ab], {
                                  type: mimeType,
                                });
                                const url = window.URL.createObjectURL(blob);
  
                                // Create and trigger download
                                const link = document.createElement("a");
                                link.href = url;
  
                                // Determine file extension
                                const extension = attachment.image_base64
                                  ? "jpg"
                                  : mimeType.split("/")[1] || "file";
                                link.setAttribute(
                                  "download",
                                  `attachment_${attachment.id}.${extension}`
                                );
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error("Download failed:", error);
                                alert(t("viewAsset.fields.downloadError"));
                              }
                            }}
                          >
                            {t("viewAsset.fields.attachments.download")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {currentAttachment && (
                  <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6">
                    {currentAttachment.displayUrl &&
                      (currentAttachment.image_base64 ? (
                        <img
                          src={currentAttachment.displayUrl}
                          alt="Attachment"
                          className="max-w-full h-auto mt-2 sm:mt-4 mx-auto"
                        />
                      ) : (
                        <iframe
                          src={currentAttachment.displayUrl}
                          className="w-full h-64 sm:h-96 border-0 mt-2 sm:mt-4"
                          title="Document Viewer"
                        />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center py-6 sm:py-8 text-gray-500">{t("viewAsset.noDetails")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  ) : null;
};

export default ViewData;

const formatKey = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};