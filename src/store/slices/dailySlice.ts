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
    toggleDaily: (state, action: PayloadAction<Task>) => {
      const task = state.daily.find(t => t.id === action.payload.id);
      if (task) {
        task.done = !task.done;
      }
    },
    delDaily: (state, action: PayloadAction<Task>) => {
      state.daily = state.daily.filter(t => t.id !== action.payload.id);
    },
  },
});

export const { addDaily, toggleDaily, delDaily } = dailySlice.actions;
export default dailySlice.reducer;
