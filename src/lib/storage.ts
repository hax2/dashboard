import { todayISO } from "./utils";
import { Project, Task, WeeklyTask, DailyHistoryEntry } from "../types";

export const STORAGE = {
  daily: "samer-daily-tasks",
  weekly: "samer-weekly-tasks",
  projects: "samer-projects",
  scratch: "samer-scratchpad",
  completed: "samer-completed",
  deleted: "samer-deleted",
  history: "samer-daily-history",
} as const;

export const STORAGE_KEYS = Object.values(STORAGE);

export const exportAllData = () => {
  const dump: Record<string, unknown> = {};
  STORAGE_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v) dump[k] = JSON.parse(v);
  });
  const blob = new Blob([JSON.stringify(dump, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importAllData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target!.result as string);
      STORAGE_KEYS.forEach((k) => {
        if (k in json) localStorage.setItem(k, JSON.stringify(json[k]));
      });
      location.reload();
    } catch {
      alert("Invalid backup file");
    }
  };
  reader.readAsText(file);
};
