import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/store';
import { getDayStart } from 'src/utils/dates/getDayStart';
import { getDayEnd } from 'src/utils/dates/getDayEnd';
import { Session } from 'src/types/sessions';

export const selectDaySessions = createSelector(
  [
    (state: RootState) => state.api.queries,
    (_: RootState, day: string) => day,
  ],
  (queries, day) => {
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
    const filteredSessions = sessions
      .filter((session) => new Date(session.startTime) > new Date(getDayStart(day)))
      .filter((session) => new Date(session.startTime) < new Date(getDayEnd(day)))
      .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return {
      data: filteredSessions,
      status: 'fulfilled',
      error: null,
    };
  }
)