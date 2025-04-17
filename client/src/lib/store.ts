import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { schedulingApi } from './schedulingApi';
import slotsMutationsSlice from 'src/features/slots/slotsMutationsSlice';
import sessionsMutationsSlice from 'src/features/sessions/sessionsMutationsSlice';

export const store = configureStore({
  reducer: {
    [schedulingApi.reducerPath]: schedulingApi.reducer,
    slotsMutations: slotsMutationsSlice,
    sessionsMutations: sessionsMutationsSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['slotsMutations/slotsMutationAdded'],
        ignoredPaths: ['slotsMutations', 'payload.startTime'],
      },
    }).concat(schedulingApi.middleware)
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;