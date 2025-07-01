import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  currentLanguages: "en",
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguages: (state, action) => {
      state.currentLanguages = action.payload;
    },
  },
});

export const { setLanguages } = languageSlice.actions;
export const getLanguage = (state) => state.language;
export default languageSlice.reducer;
