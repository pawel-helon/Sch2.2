import { api } from 'src/redux/api';
import { validateRequest } from 'src/utils/validation/validateRequest';
import { validateResponse } from 'src/utils/validation/validateResponse';
import { Slot } from 'src/types';
import { infoAdded } from 'src/redux/slices/infoSlice';

const updateSlotsForReschedulingSession = api.injectEndpoints({
  endpoints: (builder) => ({
    updateSlotsForReschedulingSession: builder.mutation<{ message: string , data: Slot[] | null }, { employeeId: string, day: string }>({
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
          const { message, data } = res.data;

          /** Return on failed action. */
          if (message !== 'Slots have been fetched.') {
            dispatch(infoAdded({ message: 'Failed to fetch slots.' }));
            console.error(message);
            return;
          };
          
          const slots = data as Slot[];

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