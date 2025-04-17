import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "src/lib/types";

interface SessionsState {
  data: Session[],
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null
}

const initialState: SessionsState = {
  data: [],
  status: 'idle',
  error: null
}

const sessionsMutationsSlice = createSlice({
  name: 'sessionsMutations',
  initialState,
  reducers: {
    sessionsMutationAdded(state, action: PayloadAction<Session>) {
      const session = action.payload;
      console.log('sessionsMutations: ', session);
      state.data.push(session);
    },
    sessionsMutationRemoved(state, action: PayloadAction<string>) {
      const sessionId = action.payload;
      state.data.filter(session => session.id !== sessionId);
    }
  },
})

export default sessionsMutationsSlice.reducer;

export const { sessionsMutationAdded, sessionsMutationRemoved } = sessionsMutationsSlice.actions;