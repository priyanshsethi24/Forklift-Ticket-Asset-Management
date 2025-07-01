import { createSlice } from '@reduxjs/toolkit';

const translationSlice = createSlice({
  name: 'translation',
  initialState: {
    isTranslating: false,
    currentLanguage: 'en',
    translatedData: null,
    error: null
  },
  reducers: {
    setTranslating: (state, action) => {
      state.isTranslating = action.payload;
    },
    setTranslatedData: (state, action) => {
      state.translatedData = action.payload;
    },
    setCurrentLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { setTranslating, setTranslatedData, setCurrentLanguage, setError } = translationSlice.actions;
export default translationSlice.reducer; 