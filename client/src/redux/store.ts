import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { schedulingApi } from 'src/api/schedulingApi';
import undoSlice from 'src/redux/slices/undoSlice';
import infoSlice from 'src/redux/slices/infoSlice';

export const store = configureStore({
  reducer: {
    [schedulingApi.reducerPath]: schedulingApi.reducer,
    undo: undoSlice,
    info: infoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['undo/undoAdded'],
        ignoredPaths: ['undo', 'payload.startTime'],
      },
    }).concat(schedulingApi.middleware)
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;