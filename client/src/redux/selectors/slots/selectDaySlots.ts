import { createSelector } from '@reduxjs/toolkit';
import { getDayStart } from 'src/utils/dates/getDayStart';
import { getDayEnd } from 'src/utils/dates/getDayEnd';
import { Slot } from 'src/types/slots';
import { RootState } from 'src/redux/store';

export const selectDaySlots = createSelector(
  [
    (state: RootState) => state.api.queries,
    (_: RootState, day: string) => day,
  ],
  (queries, day) => {
    const queryData = Object.values(queries)
      .find((query) => query?.endpointName === 'getSlots' && query?.data)?.data as {
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
    const filteredSlots = slots
      .filter((slot) => new Date(slot.startTime) > new Date(getDayStart(day)))
      .filter((slot) => new Date(slot.startTime) < new Date(getDayEnd(day)))
      .filter((slot) => slot.type === 'AVAILABLE');

    return {
      data: filteredSlots,
      status: 'fulfilled',
      error: null,
    };
  }
)