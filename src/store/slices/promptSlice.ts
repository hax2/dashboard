import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PromptState {
  open: boolean;
  label: string;
  onSubmit: ((value: string) => void) | null;
}

const initialState: PromptState = {
  open: false,
  label: '',
  onSubmit: null,
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    openPrompt: (state, action: PayloadAction<{ label: string; onSubmit: (value: string) => void }>) => {
      state.open = true;
      state.label = action.payload.label;
      state.onSubmit = action.payload.onSubmit;
    },
    closePrompt: (state) => {
      state.open = false;
      state.label = '';
      state.onSubmit = null;
    },
  },
});

export const { openPrompt, closePrompt } = promptSlice.actions;
export default promptSlice.reducer;
