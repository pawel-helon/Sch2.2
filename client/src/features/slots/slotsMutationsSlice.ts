import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Slot } from "src/lib/types";

interface SlotsMutationsState {
  data: { message: string | null, slot: Slot }[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null
}

const initialState: SlotsMutationsState = {
  data: [],
  status: 'idle',
  error: null
}

const slotsMutationsSlice = createSlice({
  name: 'slotsMutations',
  initialState,
  reducers: {
    slotsMutationAdded(state, action: PayloadAction<{ message: string | null, slot: Slot }>) {
      const data = action.payload;
      state.data.push(data);
    },
    slotsMutationRemoved(state, action: PayloadAction<string>) {
      const slotId = action.payload;
      state.data = state.data.filter(mutation => mutation.slot.id !== slotId);
    },
  },
})

export default slotsMutationsSlice.reducer;

export const { slotsMutationAdded, slotsMutationRemoved } = slotsMutationsSlice.actions;