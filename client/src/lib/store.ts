import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { schedulingApi } from './schedulingApi';

export const store = configureStore({
  reducer: {
    [schedulingApi.reducerPath]: schedulingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(schedulingApi.middleware)
});

export const makeStore = () => {
  return store;
}

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;