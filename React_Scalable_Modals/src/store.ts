
import { configureStore } from '@reduxjs/toolkit';
import confirmationReducer from './modal/confirmation.slice';



export const store = configureStore({
  reducer: {
    confirmation: confirmationReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
