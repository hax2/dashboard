import { todayISO } from "./utils";
import { Project, Task, WeeklyTask, DailyHistoryEntry } from "../types";

export const STORAGE = {
  daily: "samer-daily-tasks-v2",
  weekly: "samer-weekly-tasks-v2",
  projects: "samer-projects-v2",
  scratch: "samer-scratchpad-v2",
  completed: "samer-completed-v2",
  deleted: "samer-deleted-v2",
  history: "samer-daily-history-v2",
  sidebar: "samer-sidebar-v2",
} as const;

export const STORAGE_KEYS = Object.values(STORAGE);

export const exportAllData = () => {
  const dump: Record<string, unknown> = {};
  STORAGE_KEYS.forEach((k) => {
    const v = localStorage.getItem(k);
    if (v) {
      try {
        dump[k] = JSON.parse(v);
      } catch (e) {
        console.error(`Error parsing localStorage key "${k}":`, e);
        // Do not return; continue processing other keys even if one is corrupted
      }
    }
  });

  console.log("Data to be exported:", dump); // Log the data being exported

  try {
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Error creating or downloading backup file:", e);
    alert("Error: Could not create or download the backup file. Please check your browser's console for details.");
  }
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
