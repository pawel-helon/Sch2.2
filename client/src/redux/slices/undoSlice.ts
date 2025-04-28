import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Slot } from 'src/types/slots';
import { Session } from 'src/types/sessions';

interface UndoState {
  payload: {
    message: string,
    data: Slot[] | Session[]
  }[]
}

const initialState: UndoState = { payload: [] };

const undoSlice = createSlice({
  name: 'undo',
  initialState,
  reducers: {
    undoAdded(state, action: PayloadAction<{ message: string, data: Slot[] | Session[] }>) {
      const data = action.payload;
      state.payload.push(data);
    },
    undoRemoved(state, action: PayloadAction<{ message: string, id: string }>) {
      const message = action.payload.id;
      const id = action.payload.id;
      state.payload = state.payload.filter(e => (e.message[0] !== message && e.data[0].id !== id));
    },
  },
})

export default undoSlice.reducer;

export const { undoAdded, undoRemoved } = undoSlice.actions;