import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'src/redux/store';
import { SlotsRecurringDate } from 'src/types/slots-recurring-dates';

export const selectSlotsRecurringDay = createSelector(
  [
    (state: RootState) => state.api.queries,
    (_: RootState, day: string) => day,
  ],
  (queries, day) => {
    const queryData = Object.values(queries)
      .find((query) => query?.endpointName === 'getWeekSlotsRecurringDates' && query?.data)?.data as {
        byId: Record<string, SlotsRecurringDate>;
        allIds: string[];
      };

    if (!queryData) {
      return {
        data: [],
        status: 'fulfilled',
        error: null,
      };
    }

    const slotsRecurringDates = Object.values(queryData.byId) as SlotsRecurringDate[];
    const filteredslotsRecurringDates = slotsRecurringDates
      .filter((slotsRecurringDate) => slotsRecurringDate.date === day)

    let result: boolean = false;
    if (filteredslotsRecurringDates.length === 1) {
      result = true
    }

    return {
      data: result,
      status: 'fulfilled',
      error: null,
    };
  }
)