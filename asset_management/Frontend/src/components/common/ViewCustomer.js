import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCustomerData } from "../../redux/slices/customerSlice";

const ViewCustomer = (props) => {
  const { id, setViewCustomerId } = props;
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { allCustomer } = useSelector(selectCustomerData);

  useEffect(() => {
    if (id) {
      setSelectedCustomer(id);
      setShowModal(true);
    } else {
      toast.error("Customer not found");
      setViewCustomerId(null);
    }
  }, [id, allCustomer, setViewCustomerId]);

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const closeModal = () => {
    setShowModal(false);
    setViewCustomerId(null);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white -lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150"
            onClick={closeModal}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {selectedCustomer ? (
            <div className="space-y-3">
              {Object.entries(selectedCustomer).map(([key, value]) => {
                // Skip certain fields that shouldn't be displayed
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
                } else if (typeof value === "object") {
                  displayValue = JSON.stringify(value);
                }

                return (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-100">
                    <div className="font-medium text-gray-700">{formatKey(key)}:</div>
                    <div className="md:col-span-2 text-gray-900 break-words">{displayValue}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No details available for this customer.</p>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-blue-600 text-white  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;