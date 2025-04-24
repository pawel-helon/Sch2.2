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
    undoRemoved(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.payload = state.payload.filter(e => e.data[0].id !== id);
    },
  },
})

export default undoSlice.reducer;

export const { undoAdded, undoRemoved } = undoSlice.actions;