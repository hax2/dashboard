import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { uuid } from '../../lib/utils';

interface ProjectsState {
  projects: Project[];
}

const initialState: ProjectsState = {
  projects: [],
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<string>) => {
      state.projects.unshift({
        id: uuid(),
        title: action.payload,
        completed: false,
        deleted: false,
        subtasks: [],
        notes: '',
      });
    },
    delProject: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        project.deleted = true;
      }
    },
    completeProject: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        project.completed = true;
      }
    },
    addSubtask: (state, action: PayloadAction<{ projectId: string; text: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.subtasks.push({ id: uuid(), text: action.payload.text, done: false });
      }
    },
    toggleSubtask: (state, action: PayloadAction<{ projectId: string; subtaskId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const subtask = project.subtasks.find(s => s.id === action.payload.subtaskId);
        if (subtask) {
          subtask.done = !subtask.done;
        }
      }
    },
    delSubtask: (state, action: PayloadAction<{ projectId: string; subtaskId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.subtasks = project.subtasks.filter(s => s.id !== action.payload.subtaskId);
      }
    },
    addAISubtasks: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        const newSubtasks = ["Research", "Outline", "Draft", "Review", "Finalize"]
          .filter((t) => !project.subtasks.some((s) => s.text === t))
          .map((t) => ({ id: uuid(), text: t, done: false }));
        project.subtasks.push(...newSubtasks);
      }
    },
    setNotes: (state, action: PayloadAction<{ projectId: string; notes: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.notes = action.payload.notes;
      }
    },
    restoreCompletedProject: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        project.completed = false;
      }
    },
    restoreDeletedProject: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        project.deleted = false;
      }
    },
  },
});

export const { addProject, delProject, completeProject, addSubtask, toggleSubtask, delSubtask, addAISubtasks, setNotes, restoreCompletedProject, restoreDeletedProject } = projectsSlice.actions;
export default projectsSlice.reducer;
