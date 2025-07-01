import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allWarehouses: [],
  totalWarehouses: 0,
  loading: false,
  error: null,
};

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAllWarehouses: (state, action) => {
      state.allWarehouses = action.payload.results || [];
      state.totalWarehouses = action.payload.count || 0;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setAllWarehouses, setError } = warehouseSlice.actions;

export const selectWarehouseData = (state) => state.warehouse;

export default warehouseSlice.reducer; 