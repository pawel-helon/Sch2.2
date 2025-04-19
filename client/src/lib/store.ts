import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { schedulingApi } from './schedulingApi';
import undoSlice from 'src/lib/undoSlice';

export const store = configureStore({
  reducer: {
    [schedulingApi.reducerPath]: schedulingApi.reducer,
    undo: undoSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'undo/undoAdded'
        ],
        ignoredPaths: [
          'undo',
          'payload.startTime'
        ],
      },
    }).concat(schedulingApi.middleware)
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;