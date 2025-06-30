import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/tickets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ticketSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null,
    currentTicket: null
  },
  reducers: {
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setCurrentTicket, clearCurrentTicket } = ticketSlice.actions;
export default ticketSlice.reducer; 