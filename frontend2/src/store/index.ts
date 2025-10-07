import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionSlices';
import alertsReducer from './slices/alertSlice'; // Nuevo reducer para alertas

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    alerts: alertsReducer, // Añadir el reducer de alertas
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;