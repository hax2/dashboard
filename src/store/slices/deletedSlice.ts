import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Task, WeeklyTask } from '../../types';
import { delDaily } from './dailySlice';
import { delWeekly } from './weeklySlice';

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
    addDeletedProject: (state, action: PayloadAction<Project>) => {
      console.log("Adding deleted project:", action.payload);
      state.projects.unshift(action.payload);
      console.log("Deleted projects after add:", state.projects);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(delDaily, (state, action) => {
        state.daily.unshift(action.payload);
      })
      .addCase(delWeekly, (state, action) => {
        state.weekly.unshift(action.payload);
      });
  },
});

export const { restore, purge, addDeletedProject } = deletedSlice.actions;
export default deletedSlice.reducer;
