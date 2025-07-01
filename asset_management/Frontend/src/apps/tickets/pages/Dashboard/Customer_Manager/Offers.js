/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import StatCard from "../../../../../SharedComponent/Dashboard/StatCard";
import { FaEdit, FaEye, FaPlus, FaTrash, FaChartLine } from "react-icons/fa";
import Button from "../../../../../SharedComponent/Button/Button";
import style from "./../AssetManagerDashboard.module.css";
import { useTranslation } from "react-i18next";
import { objectToQueryParams } from "../../../../../utils/commonHelper";
import { toast } from "react-toastify";
import useDebounce from "../../../../../hooks/useDebounce";
import Pagination from "../../../../../SharedComponent/Pagination";
import Loading from "../../../../../SharedComponent/Loading";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCustomerData,
  setAllOffers,
} from "../../../../../redux/slices/customerSlice";
import ViewOffer from "../../../../../components/common/ViewOffer";
import { deleteProtected, getProtected } from "../../../../../network/ApiService";
import { API_END_POINTS } from "../../../../../network/apiEndPoint";
import UpdateOfferPage from "../../../../../components/common/UpdateOfferPage";
import CreateOfferPage from "../../../../../components/common/CreateOfferPage";
import { useNavigate } from "react-router-dom";
import HeroSection from "../../../../../components/HeroSection/HeroSection";
const limit = 5;
const Offers = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewOfferID, setViewOfferID] = useState(null);
  const [editOffer, setEditOffer] = useState(null);
  const dispatch = useDispatch();
  const { allOffers, totalOffers } = useSelector(selectCustomerData);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Reset pagination when searching
    setCurrentPage(1);
  };

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery !== undefined || debouncedQuery !== null) {
      setCurrentPage((pre) => 0);
      getOffers();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    getOffers();
  }, [currentPage, filters.status]);

  useEffect(() => {
    const filtered = allOffers.filter(offer => {
      const offerId = offer.id ? offer.id.toString() : '';
      const offerDetails = offer.details ? offer.details.toLowerCase() : '';
      const matchesSearch = offerId.includes(debouncedQuery) || offerDetails.includes(debouncedQuery.toLowerCase());
      const matchesStatus = statusFilter ? offer.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
    setFilteredOffers(filtered);
  }, [debouncedQuery, allOffers, statusFilter]);

  const getOffers = async () => {
    try {
      setLoading(true);
      const query = {
        page: currentPage + 1,
        page_size: limit,
      };
      if (filters.status) query.status = filters.status;
      if (searchQuery?.trim()) {
        if (!isNaN(parseInt(searchQuery[0]))) {
          query.offer_details = searchQuery;
        }
      }
      const newQuery = objectToQueryParams(query);
      const url = `${API_END_POINTS.createOffer}?${newQuery}`;
      const response = await getProtected(url);
      if (response) {
        dispatch(setAllOffers(response));
        setLoading(false);
      }
    } catch (e) {
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(t("assets.messages.fetchError"));
      }
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    const confirmDelete = window.confirm(t("assets.messages.deleteConfirm"));
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      const url = `${API_END_POINTS.createOffer}${id}/`;
      const response = await deleteProtected(url);
      if (response) {
        toast.success(t("assets.messages.deleteSuccess"));
        getOffers();
      }
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.messages;
      if (message?.[0]?.message) {
        toast.error(t("assets.messages.deleteError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ height: "auto !important" }}>
      {/* <StatCard /> */}
      <HeroSection {...{ t, handleSearch, setSearchQuery, searchQuery }} />
      <Loading loading={loading} text={t("offers.loading.offers")} />
      <div className={style["controls-section2"]}>
        <div className={style["Control-2"]}>
          {/* <div className={style["search-box"]}>
            <input
              type="text"
              placeholder={t("common.searchPlaceholderOffer")}
              className={style["search-input"]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}

          <div className={style["filters"]}>
            <select
              className={style["filter-select2"]}
              value={statusFilter}
              onChange={(e) => {
                setCurrentPage(0);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="">{t("assets.filters.status")}</option>
              <option value="Pending">{t("offers.status.pending")}</option>
              <option value="Accepted">{t("offers.status.accepted")}</option>
              <option value="Rejected">{t("offers.status.rejected")}</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button onClick={() => navigate('/create-offer')}>
            <FaPlus /> {t("offers.actions.create")}
          </Button>
        </div>
      </div>

      <div className={style["assets-table-container"]}>
        <table className={style["assets-table"]}>
          <thead>
            <tr>
              <th>
                <div style={{ minWidth: "max-content" }}>
                  {t("offers.table.offer_Id")}
                </div>
              </th>
              <th>
                <div style={{ minWidth: "150px" }}>
                  {t("offers.table.offer_Details")}
                </div>
              </th>
              <th>
                <div style={{ minWidth: "max-content" }}>
                  {t("offers.table.status")}
                </div>
              </th>
              <th>
                <div style={{ minWidth: "150px" }}>
                  {t("offers.table.terms")}
                </div>
              </th>
              <th>
                <div style={{ minWidth: "max-content" }}>
                  {t("offers.table.price")}
                </div>
              </th>
              <th>
                <div style={{ minWidth: "max-content" }}>
                  {t("common.actions")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOffers?.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.id}</td>
                <td>{offer.offer_details}</td>
                <td>{t(`offers.status.${offer.status.toLowerCase()}`)}</td>
                <td>{offer.terms}</td>
                <td>{offer.price}</td>
                <td>
                  <div className={style["action-buttons"]}>
                    <button
                      className={style["btn-view"]}
                      onClick={() => setViewOfferID(offer)}
                      title={t("offers.actions.view")}
                    >
                      <FaEye />
                    </button>
                    <button
                      className={style["btn-edit"]}
                      onClick={() => {
                        navigate(`/update-offer/${offer.id}`);
                      }}
                      title={t("offers.actions.edit")}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={style["btn-delete"]}
                      onClick={() => handleDeleteOffer(offer.id)}
                      title={t("offers.actions.delete")}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            width: "100%",
            margin: "15px 0",
            justifyContent: "space-around",
          }}
        >
          <Pagination
            totalItems={totalOffers}
            setItemOffset={setCurrentPage}
            itemOffset={currentPage}
            limit={limit}
          />
        </div>
      </div>
      {/* <CreateOffer show={showModal} onClose={setShowModal} /> */}
      {/* <UpdateOfferPage editOffer={editOffer} onClose={setEditOffer} /> */}
      {viewOfferID && (
        <ViewOffer
          id={viewOfferID}
          setViewOfferId={setViewOfferID}
        />
      )}
    </div>
  );
};

export default Offers;
