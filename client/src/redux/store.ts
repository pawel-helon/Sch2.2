import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { api } from 'src/redux/api';
import undoSlice from 'src/redux/slices/undoSlice';
import infoSlice from 'src/redux/slices/infoSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    undo: undoSlice,
    info: infoSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['undo/undoAdded'],
        ignoredPaths: ['undo', 'payload.startTime'],
      },
    }).concat(api.middleware)
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;