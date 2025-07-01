import { configureStore } from "@reduxjs/toolkit";
import assetReducer from "./slices/assetsSlice";
import customerReducer from "./slices/customerSlice";
import warehouseReducer from "./slices/warehouseSlice";
import languageReducer from "./slices/languageSlice";

export const store = configureStore({
  reducer: {
    assets: assetReducer,
    customer: customerReducer,
    warehouse: warehouseReducer,
    language: languageReducer,
  },
});
