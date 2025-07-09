import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';
import { uuid } from '../../lib/utils';

interface DailyState {
  daily: Record<string, Task[]>;
}

const initialState: DailyState = {
  daily: {},
};

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    addDaily: (state, action: PayloadAction<{ date: string; text: string }>) => {
      const { date, text } = action.payload;
      if (!state.daily[date]) {
        state.daily[date] = [];
      }
      state.daily[date].push({ id: uuid(), text, done: false });
    },
    toggleDaily: (state, action: PayloadAction<{ date: string; id: string }>) => {
      const { date, id } = action.payload;
      const tasks = state.daily[date];
      if (tasks) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.done = !task.done;
        }
      }
    },
    delDaily: (state, action: PayloadAction<{ date: string; id: string }>) => {
      const { date, id } = action.payload;
      const tasks = state.daily[date];
      if (tasks) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.deleted = true;
        }
      }
    },
    restoreDaily: (state, action: PayloadAction<{ date: string; id: string }>) => {
      const { date, id } = action.payload;
      const tasks = state.daily[date];
      if (tasks) {
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.deleted = false;
        }
      }
    },
    resetDaily: (state, action: PayloadAction<string>) => {
      const date = action.payload;
      const tasks = state.daily[date];
      if (tasks) {
        tasks.forEach(task => {
          task.done = false;
        });
      }
    },
  },
});

export const { addDaily, toggleDaily, delDaily, restoreDaily, resetDaily } = dailySlice.actions;
export default dailySlice.reducer;
