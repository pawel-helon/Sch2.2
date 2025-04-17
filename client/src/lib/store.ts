import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { schedulingApi } from './schedulingApi';
import slotsMutationsSlice from 'src/features/slots/slotsMutationsSlice';

export const store = configureStore({
  reducer: {
    [schedulingApi.reducerPath]: schedulingApi.reducer,
    slotsMutations: slotsMutationsSlice,
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