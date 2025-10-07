import { createSlice } from '@reduxjs/toolkit';

interface AlertsState {
  isAlertsOpen: boolean;
}

const initialState: AlertsState = {
  isAlertsOpen: true, // Estado inicial: alertas visibles al recargar
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlertsOpen: (state, action: { payload: boolean }) => {
      state.isAlertsOpen = action.payload;
    },
  },
});

export const { setAlertsOpen } = alertsSlice.actions;
export default alertsSlice.reducer;