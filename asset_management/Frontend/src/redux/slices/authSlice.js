import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('name') ? {
      name: localStorage.getItem('name'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
    } : null,
    isLoggedIn: !!localStorage.getItem('access'),
    loading: false,
    error: null
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoggedIn = false;
      state.user = null;
      state.error = action.payload;
      // Clear localStorage
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('userRole');
      localStorage.removeItem('name');
      localStorage.removeItem('userEmail');
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  }
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer; 