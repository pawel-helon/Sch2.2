import { schedulingApi } from 'src/lib/schedulingApi';
import { NormalizedSlots, Slot } from 'src/lib/types';

export const slotsSlice = schedulingApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeekSlots: builder.query<NormalizedSlots[], { employeeId: string, start: string, end: string }>({
      query: (body) => ({
        url: 'slots/get-week-slots',
        method: 'POST',
        body
      }),
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return [response.data];
      },
      providesTags: ['Slots']
    }),
    addSlot: builder.mutation<Slot, { employeeId: string, day: string }>({
      query: (body) => ({
        url: 'slots/add-slot',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    addRecurringSlot: builder.mutation<NormalizedSlots[], { employeeId: string, day: string }>({
      query: (body) => ({
        url: 'slots/add-recurring-slot',
        method: 'POST',
        body
      }),
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return [response.data];
      },
      invalidatesTags: ['Slots']
    }),
    addSlots: builder.mutation<NormalizedSlots[], { slots: Slot[] }>({
      query: (body) => ({
        url: 'slots/add-slots',
        method: 'POST',
        body
      }),
      transformResponse: (response: { message: string; data: NormalizedSlots }) => {
        return [response.data];
      },
      invalidatesTags: ['Slots']
    }),
    updateSlotHour: builder.mutation<Slot, { employeeId: string, slotId: string, hour: string } >({
      query: (body) => ({
        url: 'slots/update-slot-hour',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    updateRecurringSlotHour: builder.mutation<Slot, { employeeId: string, slotId: string, hour: string } >({
      query: (body) => ({
        url: 'slots/update-recurring-slot-hour',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    updateSlotMinutes: builder.mutation<Slot, { employeeId: string, slotId: string, minutes: string } >({
      query: (body) => ({
        url: 'slots/update-slot-minutes',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    updateRecurringSlotMinutes: builder.mutation<Slot, { employeeId: string, slotId: string, minutes: string }>({
      query: (body) => ({
        url: 'slots/update-recurring-slot-minutes',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    deleteSlots: builder.mutation<string[], { employeeId: string, slotIds: string[] }>({
      query: (body) => ({
        url: 'slots/delete-slots',
        method: 'DELETE',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    duplicateDay: builder.mutation<NormalizedSlots, { employeeId: string, day: string, selectedDays: string[] }>({
      query: (body) => ({
        url: 'slots/duplicate-day',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    setSlotRecurrence: builder.mutation<NormalizedSlots, { slotId: string }>({
      query: (body) => ({
        url: 'slots/set-slot-recurrence',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Slots']
    }),
    disableSlotRecurrence: builder.mutation<NormalizedSlots, { slotId: string }>({
      query: (body) => ({
        url: 'slots/disable-slot-recurrence',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Slots']
    })
  }),
})

export const {
  useGetWeekSlotsQuery,
  useAddSlotMutation,
  useAddRecurringSlotMutation,
  useAddSlotsMutation,
  useUpdateSlotHourMutation,
  useUpdateRecurringSlotHourMutation,
  useUpdateSlotMinutesMutation,
  useUpdateRecurringSlotMinutesMutation,
  useDeleteSlotsMutation,
  useDuplicateDayMutation,
  useSetSlotRecurrenceMutation,
  useDisableSlotRecurrenceMutation
} = slotsSlice;
