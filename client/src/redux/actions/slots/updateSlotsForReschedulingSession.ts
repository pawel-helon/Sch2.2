import { api } from 'src/redux/api';
import { DATE_REGEX, UUID_REGEX } from 'src/constants/regex';
import { Slot } from 'src/types/slots';

const validateInput = (input: { employeeId: string, day: string }): void => {
  if (!input || typeof input !== 'object') {
    throw new Error('Input is required. Expected an object.');
  }
  const { employeeId, day } = input;

  if (!employeeId || !day) {
    throw new Error('All fields are required: employeeId, day');
  }

  if (!UUID_REGEX.test(employeeId)) {
    throw new Error('Invalid employeeId format. Expected UUID.');
  }

  if (!DATE_REGEX.test(day)) {
    throw new Error('Invalid start date format. Expected YYYY-MM-DD.');
  }
}

const updateSlotsForReschedulingSession = api.injectEndpoints({
  endpoints: (builder) => ({
    updateSlotsForReschedulingSession: builder.mutation<Slot[], { employeeId: string, day: string }>({
      query: (body) => {
        validateInput(body);
        return {
          url: 'slots/update-slots-for-rescheduling-session',
          method: 'POST',
          body
        }
      },
      transformResponse: (response: { message: string; data: Slot[] }) => {
        return response.data;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          const slots = res.data;

          /** Clear cached getSlotsForReschedulingSession data */
          dispatch(api.util.updateQueryData(
            'getSlotsForReschedulingSession',
            { employeeId: args.employeeId },
            () => ({
              byId: {},
              allIds: []
            })
          ));
          
          /** Insert fetched slots in cached getSlotsForReschedulingSession data */
          dispatch(api.util.patchQueryData(
            'getSlotsForReschedulingSession',
            { employeeId: args.employeeId },
            slots.flatMap((slot) =>
              [
                {
                  op: 'add',
                  path: ['byId', slot.id],
                  value: slot
                },
                {
                  op: 'add',
                  path: ['allIds', '-'],
                  value: slot.id
                }
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