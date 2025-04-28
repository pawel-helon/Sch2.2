import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InfoState {
  payload : {
    message: string
  }[]
}

const initialState: InfoState = { payload: [] };

const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {
    infoAdded(state, action: PayloadAction<{ message: string }>) {
      const data = action.payload as { message: string };
      console.log(data);
      state.payload.push(data);
    },
    infoRemoved(state, action: PayloadAction<string>) {
      const message = action.payload;
      state.payload = state.payload.filter(e => e.message[0] !== message);
    },
  },
})

export default infoSlice.reducer;

export const { infoAdded, infoRemoved } = infoSlice.actions;