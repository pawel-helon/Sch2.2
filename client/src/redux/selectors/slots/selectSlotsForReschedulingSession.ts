import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/store';
import { Slot } from 'src/types';

export const selectSlotsForReschedulingSession = createSelector(
  [
    (state: RootState) => state.api.queries,
  ],
  (queries) => {
    const queryData = Object.values(queries)
      .find((query) => query?.endpointName === 'getSlotsForReschedulingSession' && query?.data)?.data as {
        byId: Record<string, Slot>;
        allIds: string[];
      };

    if (!queryData) {
      return {
        data: [],
        status: 'fulfilled',
        error: null,
      };
    }

    const slots = Object.values(queryData.byId) as Slot[];

    return {
      data: slots,
      status: 'fulfilled',
      error: null,
    };
  }
)