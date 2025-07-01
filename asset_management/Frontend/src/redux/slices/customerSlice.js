import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allCustomerAssets: [],
  totalCustomerAssets: 0,
  customerDashboard: {},
  allCustomer: [],
  totalCustomer: 0,
  allOffers: [],
  totalOffers: 0,
};

export const customerSlice = createSlice({
  name: "assets",
  initialState: initialState,
  reducers: {
    setAllCustomerAssets: (state, action) => {
      state.allCustomerAssets = action.payload.results;
      state.totalCustomerAssets = action.payload.count;
    },
    setCustomerDashboard: (state, action) => {
      state.customerDashboard = action.payload;
    },
    setAllCustomer: (state, action) => {
      state.allCustomer = action.payload.results;
      state.totalCustomer = action.payload.count;
    },
    setAllOffers: (state, action) => {
      state.allOffers = action.payload.results;
      state.totalOffers = action.payload.count;
    },
  },
});

export const {
  setAllCustomerAssets,
  setCustomerDashboard,
  setAllCustomer,
  setAllOffers,
} = customerSlice.actions;

export const selectCustomerData = (state) => state.customer;

export default customerSlice.reducer;
