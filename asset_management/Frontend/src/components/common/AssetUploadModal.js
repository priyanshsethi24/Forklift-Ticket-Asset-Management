import React, { useState, useEffect } from 'react';
import { FaUpload, FaImage, FaFile, FaTimes, FaDownload } from 'react-icons/fa';
import { getProtected } from '../../network/ApiService';
import { API_END_POINTS } from '../../network/apiEndPoint';

const AssetMediaUpload = ({ assetId, onUploadComplete }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExistingMedia();
  }, [assetId]);

  const fetchExistingMedia = async () => {
    try {
      const response = await getProtected(`${API_END_POINTS.assetMedia}${assetId}/attachments/`);
      setExistingImages(response.images);
      setExistingDocs(response.documents);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + selectedImages.length + files.length > 20) {
      setError('Maximum 20 images allowed');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
    setError(null);
  };

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDocs([...selectedDocs, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeDoc = (index) => {
    setSelectedDocs(selectedDocs.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedImages.length && !selectedDocs.length) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    selectedImages.forEach(image => {
      formData.append('images', image);
    });
    selectedDocs.forEach(doc => {
      formData.append('documents', doc);
    });

    try {
      await getProtected(`${API_END_POINTS.assetMedia}${assetId}/attachments/`, {
        method: 'POST',
        body: formData,
      });

      setSelectedImages([]);
      setSelectedDocs([]);
      fetchExistingMedia();
      onUploadComplete?.();
    } catch (err) {
      setError('Failed to upload files. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="asset-media-upload">
      <div className="upload-section">
        {/* ... existing upload boxes ... */}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Display existing images */}
      {existingImages.length > 0 && (
        <div className="existing-files">
          <h4>Uploaded Images ({existingImages.length}/20)</h4>
          <div className="image-grid">
            {existingImages.map((img) => (
              <div key={img.id} className="image-item">
                <img src={img.url} alt="Asset" />
                <a href={img.url} download className="download-btn">
                  <FaDownload />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display existing documents */}
      {existingDocs.length > 0 && (
        <div className="existing-files">
          <h4>Uploaded Documents</h4>
          <div className="doc-list">
            {existingDocs.map((doc) => (
              <div key={doc.id} className="doc-item">
                <FaFile className="doc-icon" />
                <span>{doc.name}</span>
                <a href={doc.url} download className="download-btn">
                  <FaDownload />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... rest of the component (selected files display and upload button) ... */}
    </div>
  );
};

export default AssetMediaUpload;