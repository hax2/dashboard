import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Task, WeeklyTask } from '../../types';

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
    addCompletedDaily: (state, action: PayloadAction<Task>) => {
      state.daily.unshift(action.payload);
    },
    addCompletedWeekly: (state, action: PayloadAction<WeeklyTask>) => {
      state.weekly.unshift(action.payload);
    },
    addCompletedProject: (state, action: PayloadAction<Project>) => {
      console.log("Adding completed project:", action.payload);
      state.projects.unshift(action.payload);
      console.log("Completed projects after add:", state.projects);
    },
  },
});

export const { undone, addCompletedDaily, addCompletedWeekly, addCompletedProject } = completedSlice.actions;
export default completedSlice.reducer;
