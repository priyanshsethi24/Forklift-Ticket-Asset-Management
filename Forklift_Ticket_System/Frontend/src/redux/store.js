import { configureStore } from '@reduxjs/toolkit';
import ticketReducer from './slices/ticketSlice';
import authReducer from './slices/authSlice';
import roleReducer from './slices/roleSlice';
import translationReducer from '../store/translationSlice';
export const store = configureStore({
  reducer: {
    tickets: ticketReducer,
    auth: authReducer,
    roles: roleReducer,
    translation: translationReducer
  }
}); 