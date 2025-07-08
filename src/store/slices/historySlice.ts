import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DailyHistoryEntry } from '../../types';
import { todayISO } from '../../lib/utils';

interface HistoryState {
  history: DailyHistoryEntry[];
}

const initialState: HistoryState = {
  history: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    newDay: (state, action: PayloadAction<string[]>) => {
      const doneTasks = action.payload;
      if (doneTasks.length) {
        state.history.unshift({
          date: todayISO(),
          tasks: doneTasks,
        });
        state.history = state.history.filter((e) => e.date !== todayISO());
      }
    },
  },
});

export const { newDay } = historySlice.actions;
export default historySlice.reducer;
