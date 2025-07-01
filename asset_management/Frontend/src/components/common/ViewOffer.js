import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectCustomerData } from "../../redux/slices/customerSlice";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

const ViewOffer = (props) => {
  const { id, setViewOfferId } = props;
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { allOffers } = useSelector(selectCustomerData);

  useEffect(() => {
    // if (id && Number.isInteger(id)) {
      const offer = id;
      if (offer) {
        setSelectedOffer(offer);
        setShowModal(true);
    } else {
        toast.error("Offer not found");
        setViewOfferId(null);
      }
    // }
  }, [id, allOffers, setViewOfferId]);

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return showModal ? (
    <Modal show={showModal} onHide={() => {
      setShowModal(false);
      setViewOfferId(null);
    }} size="lg">
      <div className="modal-header">
        <h2>Offer Details</h2>
        <button
          className="close-button"
          onClick={() => {
            setShowModal(false);
            setViewOfferId(null);
          }}
        >
          <FaTimes />
        </button>
      </div>
      <Modal.Body>
        {selectedOffer ? (
          Object.entries(selectedOffer).map(([key, value]) => {
            if (
              key === "created_at" ||
              key === "updated_at" ||
              key === "id" ||
              key === "attachments"
            ) {
              return null;
            }

            let displayValue = value;
            if (typeof value === "boolean") {
              displayValue = value.toString();
            } else if (value === null || value === "") {
              displayValue = "N/A";
            }

            return (
              <p key={key} className="detail-row">
                <strong>{formatKey(key)}:</strong>{" "}
                <span className="detail-value">{displayValue}</span>
              </p>
            );
          })
        ) : (
          <p>No details available for this offer.</p>
        )}
      </Modal.Body>
    </Modal>
  ) : null;
};

export default ViewOffer;
