import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inspectionReducer from './slices/inspectionSlice'; // import the slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inspection: inspectionReducer, // add it here
  },
});

// TypeScript types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
