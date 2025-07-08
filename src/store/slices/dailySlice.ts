import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';
import { uuid } from '../../lib/utils';

interface DailyState {
  daily: Task[];
}

const initialState: DailyState = {
  daily: [
    { id: uuid(), text: "work out", done: false },
    { id: uuid(), text: "go for a walk", done: false },
  ],
};

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    addDaily: (state, action: PayloadAction<string>) => {
      state.daily.push({ id: uuid(), text: action.payload, done: false });
    },
    toggleDaily: (state, action: PayloadAction<string>) => {
      const task = state.daily.find(t => t.id === action.payload);
      if (task) {
        task.done = !task.done;
      }
    },
    delDaily: (state, action: PayloadAction<string>) => {
      const task = state.daily.find(t => t.id === action.payload);
      if (task) {
        task.deleted = true;
      }
    },
    restoreDaily: (state, action: PayloadAction<string>) => {
      const task = state.daily.find(t => t.id === action.payload);
      if (task) {
        task.deleted = false;
      }
    },
    resetDaily: (state) => {
      state.daily.forEach(task => {
        task.done = false;
      });
    },
  },
});

export const { addDaily, toggleDaily, delDaily, restoreDaily, resetDaily } = dailySlice.actions;
export default dailySlice.reducer;
