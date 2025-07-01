import React, { useState } from 'react';
import { FaTimes } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const AttachmentViewer = ({ attachmentUrl, onClose }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="attachment-viewer-backdrop">
      <div className="attachment-viewer-content">
        <div className="viewer-header">
          <h3>{t('attachmentViewer.title')}</h3>
          <button
            className="close-button"
            onClick={onClose}
            aria-label={t('attachmentViewer.close')}
          >
            <FaTimes />
          </button>
        </div>
        <div className="viewer-body">
          {isLoading && <div className="loader-spinner" />}
          <iframe
            src={attachmentUrl}
            onLoad={() => setIsLoading(false)}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            title="Attachment Viewer"
          />
        </div>
      </div>
    </div>
  );
};

export default AttachmentViewer; 