export interface Task {
  id: string;
  text: string;
  done: boolean;
}
export interface WeeklyTask {
  id: string;
  text: string;
  lastCompleted: string | null;
}
export interface Project {
  id: string;
  title: string;
  completed: boolean;
  deleted: boolean;
  subtasks: Task[];
  notes: string;
}
export interface DailyHistoryEntry {
  date: string;
  tasks: string[];
}
