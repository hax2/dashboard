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
    { id: uuid(), text: "check emails", done: false },
    { id: uuid(), text: "drink 2l of water", done: false },
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
      state.daily = state.daily.filter(t => t.id !== action.payload);
    },
  },
});

export const { addDaily, toggleDaily, delDaily } = dailySlice.actions;
export default dailySlice.reducer;
