import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ViewState = "projects" | "completed" | "deleted" | "review" | { projectId: string };

interface ViewSliceState {
  currentView: ViewState;
}

const initialState: ViewSliceState = {
  currentView: "projects",
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<ViewState>) => {
      state.currentView = action.payload;
    },
  },
});

export const { setView } = viewSlice.actions;
export default viewSlice.reducer;