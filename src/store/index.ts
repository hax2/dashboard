import { configureStore } from '@reduxjs/toolkit';
import promptReducer from './slices/promptSlice';
import viewReducer from './slices/viewSlice';
import projectsReducer from './slices/projectsSlice';
import dailyReducer from './slices/dailySlice';
import weeklyReducer from './slices/weeklySlice';
import scratchReducer from './slices/scratchSlice';
import completedReducer from './slices/completedSlice';
import historyReducer from './slices/historySlice';
import sidebarReducer from './slices/sidebarSlice';
import { localStorageMiddleware, loadStateFromLocalStorage } from './middleware/localStorageMiddleware';
import { STORAGE } from '../lib/storage';

const preloadedState = {
  daily: { daily: loadStateFromLocalStorage(STORAGE.daily, []) },
  weekly: { weekly: loadStateFromLocalStorage(STORAGE.weekly, []) },
  projects: { projects: loadStateFromLocalStorage(STORAGE.projects, []) },
  scratch: { scratch: loadStateFromLocalStorage(STORAGE.scratch, '') },
  completed: loadStateFromLocalStorage(STORAGE.completed, { daily: [], weekly: [], projects: [] }),
  history: { history: loadStateFromLocalStorage(STORAGE.history, []) },
  sidebar: { isOpen: loadStateFromLocalStorage(STORAGE.sidebar, true) },
};

export const store = configureStore({
  reducer: {
    prompt: promptReducer,
    view: viewReducer,
    projects: projectsReducer,
    daily: dailyReducer,
    weekly: weeklyReducer,
    scratch: scratchReducer,
    completed: completedReducer,
    history: historyReducer,
    sidebar: sidebarReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
