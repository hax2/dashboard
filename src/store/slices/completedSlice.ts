import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Task, WeeklyTask } from '../../types';
import { delDaily, toggleDaily } from './dailySlice';
import { completeWeekly } from './weeklySlice';

interface CompletedState {
  daily: Task[];
  weekly: WeeklyTask[];
  projects: Project[];
}

const initialState: CompletedState = {
  daily: [],
  weekly: [],
  projects: [],
};

const completedSlice = createSlice({
  name: 'completed',
  initialState,
  reducers: {
    undone: (state, action: PayloadAction<{ type: "daily" | "weekly" | "projects"; id: string }>) => {
      const { type, id } = action.payload;
      if (type === "daily") {
        state.daily = state.daily.filter(t => t.id !== id);
      } else if (type === "weekly") {
        state.weekly = state.weekly.filter(t => t.id !== id);
      } else if (type === "projects") {
        state.projects = state.projects.filter(p => p.id !== id);
      }
    },
    addCompletedProject: (state, action: PayloadAction<Project>) => {
      console.log("Adding completed project:", action.payload);
      state.projects.unshift(action.payload);
      console.log("Completed projects after add:", state.projects);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleDaily, (state, action) => {
        const task = action.payload;
        if (task.done) {
          state.daily.unshift(task);
        } else {
          state.daily = state.daily.filter(t => t.id !== task.id);
        }
      })
      .addCase(completeWeekly, (state, action) => {
        state.weekly.unshift(action.payload);
      });
  },
});

export const { undone, addCompletedProject } = completedSlice.actions;
export default completedSlice.reducer;
