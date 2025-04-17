import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Slot } from "src/lib/types";

interface SlotsMutationsState {
  data: Slot[],
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
    slotsMutationAdded(state, action: PayloadAction<Slot>) {
      const slot = action.payload;
      state.data.push(slot);
    },
    slotsMutationRemoved(state, action: PayloadAction<string>) {
      const slotId = action.payload;
      state.data.filter(slot => slot.id !== slotId);
    },
  },
})

export default slotsMutationsSlice.reducer;

export const { slotsMutationAdded, slotsMutationRemoved } = slotsMutationsSlice.actions;