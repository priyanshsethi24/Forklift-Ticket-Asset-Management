import { createSlice } from '@reduxjs/toolkit';

const roleSlice = createSlice({
  name: 'roles',
  initialState: {
    userRole: localStorage.getItem('userRole') || 'user',
    permissions: {
      admin: {
        canAccessAdmin: true,
        canManageUsers: true,
        canManageTickets: true,
        canManageCustomers: true,
        canViewReports: true,
        canManageSettings: true
      },
      'ticket-manager': {
        canAccessAdmin: false,
        canManageUsers: false,
        canManageTickets: true,
        canManageCustomers: false,
        canViewReports: true,
        canManageSettings: false
      },
      'customer-manager': {
        canAccessAdmin: false,
        canManageUsers: false,
        canManageTickets: false,
        canManageCustomers: true,
        canViewReports: true,
        canManageSettings: false
      },
      user: {
        canAccessAdmin: false,
        canManageUsers: false,
        canManageTickets: false,
        canManageCustomers: false,
        canViewReports: false,
        canManageSettings: false
      }
    }
  },
  reducers: {
    setUserRole: (state, action) => {
      state.userRole = action.payload;
      localStorage.setItem('userRole', action.payload);
    },
    clearUserRole: (state) => {
      state.userRole = 'user';
      localStorage.removeItem('userRole');
    }
  }
});

export const { setUserRole, clearUserRole } = roleSlice.actions;
export default roleSlice.reducer; 