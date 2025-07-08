import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Task, WeeklyTask } from '../../types';

interface DeletedState {
  daily: Task[];
  weekly: WeeklyTask[];
  projects: Project[];
}

const initialState: DeletedState = {
  daily: [],
  weekly: [],
  projects: [],
};

const deletedSlice = createSlice({
  name: 'deleted',
  initialState,
  reducers: {
    restore: (state, action: PayloadAction<{ type: "daily" | "weekly" | "projects"; item: Task | WeeklyTask | Project }>) => {
      const { type, item } = action.payload;
      if (type === "daily") {
        state.daily = state.daily.filter(t => t.id !== item.id);
      } else if (type === "weekly") {
        state.weekly = state.weekly.filter(t => t.id !== item.id);
      } else if (type === "projects") {
        state.projects = state.projects.filter(p => p.id !== item.id);
      }
    },
    purge: (state, action: PayloadAction<{ type: "daily" | "weekly" | "projects"; id: string }>) => {
      const { type, id } = action.payload;
      if (type === "daily") {
        state.daily = state.daily.filter(t => t.id !== id);
      } else if (type === "weekly") {
        state.weekly = state.weekly.filter(t => t.id !== id);
      } else if (type === "projects") {
        state.projects = state.projects.filter(p => p.id !== id);
      }
    },
    addDeletedDaily: (state, action: PayloadAction<Task>) => {
      state.daily.unshift(action.payload);
    },
    addDeletedWeekly: (state, action: PayloadAction<WeeklyTask>) => {
      state.weekly.unshift(action.payload);
    },
    addDeletedProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
  },
});

export const { restore, purge, addDeletedDaily, addDeletedWeekly, addDeletedProject } = deletedSlice.actions;
export default deletedSlice.reducer;
