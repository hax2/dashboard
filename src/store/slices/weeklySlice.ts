import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WeeklyTask } from '../../types';
import { uuid, todayISO } from '../../lib/utils';

interface WeeklyState {
  weekly: WeeklyTask[];
}

const initialState: WeeklyState = {
  weekly: [
    { id: uuid(), text: "do laundry", lastCompleted: null },
    { id: uuid(), text: "vacuum", lastCompleted: null },
  ],
};

const weeklySlice = createSlice({
  name: 'weekly',
  initialState,
  reducers: {
    addWeekly: (state, action: PayloadAction<string>) => {
      state.weekly.push({ id: uuid(), text: action.payload, lastCompleted: null });
    },
    completeWeekly: (state, action: PayloadAction<string>) => {
      const task = state.weekly.find(t => t.id === action.payload);
      if (task) {
        task.lastCompleted = todayISO();
      }
    },
    delWeekly: (state, action: PayloadAction<string>) => {
      state.weekly = state.weekly.filter(t => t.id !== action.payload);
    },
    restoreWeekly: (state, action: PayloadAction<string>) => {
      const task = state.weekly.find(t => t.id === action.payload);
      if (task) {
        task.deleted = false;
      }
    },
  },
});

export const { addWeekly, completeWeekly, delWeekly, restoreWeekly } = weeklySlice.actions;
export default weeklySlice.reducer;
