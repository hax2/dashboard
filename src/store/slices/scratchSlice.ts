import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScratchState {
  scratch: string;
}

const initialState: ScratchState = {
  scratch: '',
};

const scratchSlice = createSlice({
  name: 'scratch',
  initialState,
  reducers: {
    setScratch: (state, action: PayloadAction<string>) => {
      state.scratch = action.payload;
    },
  },
});

export const { setScratch } = scratchSlice.actions;
export default scratchSlice.reducer;
