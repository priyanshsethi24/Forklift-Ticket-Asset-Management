import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allAssets: [],
  totalAssets: 0,
  assetDashboard: {},
};

export const assetSlice = createSlice({
  name: "assets",
  initialState:initialState,
  reducers: {
    setAllAssets: (state, action) => {
      state.allAssets = action.payload.results;
      state.totalAssets = action.payload.count;
    },
    setAssetsDashboard: (state, action) => {
      state.assetDashboard = action.payload;
    },
  },
});

export const { setAllAssets, setAssetsDashboard } = assetSlice.actions;

export const selectAssetData = (state) => state.assets;

export default assetSlice.reducer;
