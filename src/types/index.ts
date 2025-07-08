export interface Task {
  id: string;
  text: string;
  done: boolean;
  deleted?: boolean;
}
export interface WeeklyTask {
  id: string;
  text: string;
  lastCompleted: string | null;
  deleted?: boolean;
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
