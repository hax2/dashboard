import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { STORAGE } from '../../lib/storage';

export const loadStateFromLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return fallback;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.warn("Could not load state from localStorage", e);
    return fallback;
  }
};

export const localStorageMiddleware: Middleware<{}, RootState> = 
  ({ getState }) => 
  (next) => 
  (action) => {
    const result = next(action);
    const state = getState();

    try {
      localStorage.setItem(STORAGE.daily, JSON.stringify(state.daily.daily || []));
      localStorage.setItem(STORAGE.weekly, JSON.stringify(state.weekly.weekly || []));
      localStorage.setItem(STORAGE.projects, JSON.stringify(state.projects.projects || []));
      localStorage.setItem(STORAGE.scratch, JSON.stringify(state.scratch.scratch || []));
      localStorage.setItem(STORAGE.completed, JSON.stringify(state.completed || []));
      localStorage.setItem(STORAGE.deleted, JSON.stringify(state.deleted || []));
      localStorage.setItem(STORAGE.history, JSON.stringify(state.history.history || []));
    } catch (e) {
      console.warn("Could not save state to localStorage", e);
    }
    return result;
  };
