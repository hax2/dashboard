import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { todayISO } from '../../lib/utils';

type ViewState = "projects" | "completed" | "deleted" | "review" | { projectId: string };

interface ViewSliceState {
  currentView: ViewState;
  currentDay: string;
}

const initialState: ViewSliceState = {
  currentView: "projects",
  currentDay: todayISO(),
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<ViewState>) => {
      state.currentView = action.payload;
    },
    setCurrentDay: (state, action: PayloadAction<string>) => {
      state.currentDay = action.payload;
    },
    nextDay: (state) => {
      const current = new Date(state.currentDay);
      current.setDate(current.getDate() + 1);
      state.currentDay = current.toISOString().slice(0, 10);
    },
    previousDay: (state) => {
      const current = new Date(state.currentDay);
      current.setDate(current.getDate() - 1);
      state.currentDay = current.toISOString().slice(0, 10);
    },
  },
});

export const { setView, setCurrentDay, nextDay, previousDay } = viewSlice.actions;
export default viewSlice.reducer;
