import { api } from 'src/redux/api';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types/slots';

const updateSlotsForReschedulingSession = api.injectEndpoints({
  endpoints: (builder) => ({
    updateSlotsForReschedulingSession: builder.mutation<{ message: string , data: Slot[] }, { employeeId: string, day: string }>({
      query: (body) => {
        /** Validate request data. */
        validateRequest('updateSlotsForReschedulingSession', body);
        return {
          url: 'slots/update-slots-for-rescheduling-session',
          method: 'POST',
          body
        }
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slots = res.data.data;

          /** Validate response data */
          validateResponse('updateSlotsForReschedulingSession', slots)

          /** Clear cached getSlotsForReschedulingSession data */
          dispatch(api.util.updateQueryData(
            'getSlotsForReschedulingSession',
            { employeeId: args.employeeId },
            () => ({ byId: {}, allIds: [] })
          ));
          
          /** Insert fetched slots in cached getSlotsForReschedulingSession data */
          dispatch(api.util.patchQueryData(
            'getSlotsForReschedulingSession',
            { employeeId: args.employeeId },
            slots.flatMap((slot) =>
              [
                { op: 'add', path: ['byId', slot.id], value: slot },
                { op: 'add', path: ['allIds', '-'], value: slot.id }
              ]
            )
          ));
        } catch (error) {
          console.error(error);
        }
      }
    }),
  }),
})

export const { useUpdateSlotsForReschedulingSessionMutation } = updateSlotsForReschedulingSession;