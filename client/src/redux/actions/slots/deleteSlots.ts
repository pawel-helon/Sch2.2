import { api } from 'src/redux/api';
import { undoAdded } from 'src/redux/slices/undoSlice';
import { getWeekStartEndDatesFromDay } from 'src/utils/dates/getWeekStartEndDatesFromDay';
import { Slot } from 'src/types/slots';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';

const deleteSlots = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Deletes slots for a given employee.
     * 
     * @param {Object} body - The request payload.
     * @param {Slot[]} body.slots - An array of slot objects to be deleted.
     * @returns {Object} - Message and data object containing employeeId, date, and an array of deleted slot IDs.
    */
    deleteSlots: builder.mutation<{ message: string, data: { employeeId: string, date: string, slotIds: string[] } }, { slots: Slot[] }>({
      query: (body) => {
        /** Validate request data */
        validateRequest('deleteSlots', body);
        const slotIds = body.slots.map(slot => slot.id);
        return {
          url: 'slots/delete-slots',
          method: 'DELETE',
          body: { slotIds }
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const { message, data } = res.data;
          const { employeeId, date, slotIds } = data;

          /** Validate response data. */
          validateResponse('deleteSlots', { employeeId, date, slotIds });
          
          /** Store message and deleted slots in cached undoSlice data. */
          dispatch(undoAdded({ message, data: args.slots }))
          
          /** Remove deleted slots from cached getWeekSlots data. */
          const { start, end } = getWeekStartEndDatesFromDay(date);
          dispatch(api.util.patchQueryData(
            'getWeekSlots',
            { employeeId: employeeId, start: start, end: end },
            slotIds.flatMap((slotId) =>
              [
                { op: 'remove', path: ['byId', slotId], value: slotId },
                { op: 'remove', path: ['allIds', '-'] }
              ]
            )
          ));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
})

export const { useDeleteSlotsMutation } = deleteSlots;