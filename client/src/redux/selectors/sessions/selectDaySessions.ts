import { createSelector } from '@reduxjs/toolkit';
import { getDayStart } from 'src/utils/dates/getDayStart';
import { getDayEnd } from 'src/utils/dates/getDayEnd';
import { Slot } from 'src/types/slots';
import { RootState } from 'src/redux/store';

export const selectDaySessions = createSelector(
  [
    (state: RootState) => state.api.queries,
    (_: RootState, day: string) => day,
  ],
  (queries, day) => {
    const queryData = Object.values(queries)
      .find((query) => query?.endpointName === 'getWeekSessions' && query?.data)?.data as {
        byId: Record<string, Slot>;
        allIds: string[];
      };

    if (!queryData) {
      return {
        data: [],
        status: 'idle',
        error: null,
      };
    }

    const sessions = Object.values(queryData.byId) as Slot[];
    const filteredSessions = sessions
      .filter((session) => new Date(session.startTime) > new Date(getDayStart(day)))
      .filter((session) => new Date(session.startTime) < new Date(getDayEnd(day)))

    return {
      data: filteredSessions,
      status: 'fulfilled',
      error: null,
    };
  }
)