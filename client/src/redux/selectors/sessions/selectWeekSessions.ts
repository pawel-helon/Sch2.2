import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/store';
import { Session } from 'src/types/sessions';

export const selectWeekSessions = createSelector(
  [
    (state: RootState) => state.api.queries,
  ],
  (queries) => {
    const queryData = Object.values(queries)
      .find((query) => query?.endpointName === 'getWeekSessions' && query?.data)?.data as {
        byId: Record<string, Session>;
        allIds: string[];
      };

    if (!queryData) {
      return {
        data: [],
        status: 'fulfilled',
        error: null,
      };
    }

    const sessions = Object.values(queryData.byId) as Session[];
    return {
      data: sessions,
      status: 'fulfilled',
      error: null,
    };
  }
)