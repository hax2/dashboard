import { useState, useEffect, useCallback } from "react";
import {
  Project,
  Task,
  WeeklyTask,
  DailyHistoryEntry,
} from "../types";
import { loadState, saveState, STORAGE } from "../lib/storage";
import { todayISO, uuid } from "../lib/utils";

export const useStore = () => {
  const [daily, setDaily] = useState<Task[]>(() =>
    loadState(STORAGE.daily, [])
  );
  const [weekly, setWeekly] = useState<WeeklyTask[]>(() =>
    loadState(STORAGE.weekly, [])
  );
  const [scratch, setScratch] = useState<string>(() =>
    loadState(STORAGE.scratch, "")
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadState(STORAGE.projects, [])
  );
  const [completed, setCompleted] = useState<{
    daily: Task[];
    weekly: WeeklyTask[];
    projects: Project[];
  }>(() => loadState(STORAGE.completed, { daily: [], weekly: [], projects: [] }));
  const [deleted, setDeleted] = useState<{
    daily: Task[];
    weekly: WeeklyTask[];
    projects: Project[];
  }>(() => loadState(STORAGE.deleted, { daily: [], weekly: [], projects: [] }));
  const [history, setHistory] = useState<DailyHistoryEntry[]>(() =>
    loadState(STORAGE.history, [])
  );
  const [view, setView] = useState<
    "projects" | "completed" | "deleted" | "review" | { projectId: string }
  >("projects");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptLabel, setPromptLabel] = useState("");
  const [promptOnSubmit, setPromptOnSubmit] = useState<((v: string) => void)>(() => () => {});

  useEffect(() => saveState(STORAGE.daily, daily), [daily]);
  useEffect(() => saveState(STORAGE.weekly, weekly), [weekly]);
  useEffect(() => saveState(STORAGE.projects, projects), [projects]);
  useEffect(() => saveState(STORAGE.scratch, scratch), [scratch]);
  useEffect(() => saveState(STORAGE.completed, completed), [completed]);
  useEffect(() => saveState(STORAGE.deleted, deleted), [deleted]);
  useEffect(() => saveState(STORAGE.history, history), [history]);

  const openPrompt = (label: string, onSubmit: (v: string) => void) => {
    console.log("openPrompt called with label:", label);
    setIsPromptOpen(true);
    setPromptLabel(label);
    setPromptOnSubmit(() => onSubmit);
    console.log("Prompt state after setPrompt:", { open: true, label, onSubmit });
  };
  const closePrompt = () => {
    console.log("closePrompt called");
    setIsPromptOpen(false);
    setPromptLabel("");
    setPromptOnSubmit(() => () => {});
  };

  const newDay = () => {
    const done = daily.filter((t) => t.done);
    if (done.length)
      setHistory((h) => [
        { date: todayISO(), tasks: done.map((t) => t.text) },
        ...h.filter((e) => e.date !== todayISO()),
      ]);
    setDaily((d) => d.map((t) => ({ ...t, done: false })));
  };
  const addDaily = (text: string) =>
    setDaily((d) => [...d, { id: uuid(), text, done: false }]);
  const toggleDaily = (id: string) =>
    setDaily((d) => d.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const delDaily = (id: string) => {
    const t = daily.find((t) => t.id === id);
    if (!t) return;
    setDaily((d) => d.filter((t) => t.id !== id));
    setDeleted((del) => ({ ...del, daily: [t, ...del.daily] }));
  };

  const addWeekly = (text: string) =>
    setWeekly((w) => [...w, { id: uuid(), text, lastCompleted: null }]);
  const completeWeekly = (id: string) => {
    setWeekly((w) =>
      w.map((t) => (t.id === id ? { ...t, lastCompleted: todayISO() } : t))
    );
    const t = weekly.find((t) => t.id === id);
    if (t) setCompleted((c) => ({ ...c, weekly: [t, ...c.weekly] }));
  };
  const delWeekly = (id: string) => {
    const t = weekly.find((t) => t.id === id);
    if (!t) return;
    setWeekly((w) => w.filter((t) => t.id !== id));
    setDeleted((d) => ({ ...d, weekly: [t, ...d.weekly] }));
  };

  const addProject = (title: string) =>
    setProjects((p) => [
      {
        id: uuid(),
        title,
        completed: false,
        deleted: false,
        subtasks: [],
        notes: "",
      },
      ...p,
    ]);
  const delProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    setProjects((p) => p.filter((pr) => pr.id !== id));
    setDeleted((d) => ({ ...d, projects: [proj, ...d.projects] }));
    if (typeof view === "object" && view.projectId === id) setView("projects");
  };
  const completeProject = (id: string) => {
    setProjects((p) => p.map((pr) => (pr.id === id ? { ...pr, completed: true } : pr)));
    const proj = projects.find((p) => p.id === id);
    if (proj) setCompleted((c) => ({ ...c, projects: [proj, ...c.projects] }));
  };

  const addSubtask = (pid: string, text: string) =>
    setProjects((p) =>
      p.map((pr) =>
        pr.id === pid
          ? { ...pr, subtasks: [...pr.subtasks, { id: uuid(), text, done: false }] }
          : pr
      )
    );
  const toggleSubtask = (pid: string, sid: string) =>
    setProjects((p) =>
      p.map((pr) =>
        pr.id === pid
          ? {
              ...pr,
              subtasks: pr.subtasks.map((s) =>
                s.id === sid ? { ...s, done: !s.done } : s
              ),
            }
          : pr
      )
    );
  const delSubtask = (pid: string, sid: string) =>
    setProjects((p) =>
      p.map((pr) =>
        pr.id === pid
          ? { ...pr, subtasks: pr.subtasks.filter((s) => s.id !== sid) }
          : pr
      )
    );
  const addAISubtasks = (pid: string) =>
    setProjects((p) =>
      p.map((pr) =>
        pr.id === pid
          ? {
              ...pr,
              subtasks: [
                ...pr.subtasks,
                ...["Research", "Outline", "Draft", "Review", "Finalize"]
                  .filter((t) => !pr.subtasks.some((s) => s.text === t))
                  .map((t) => ({ id: uuid(), text: t, done: false })),
              ],
            }
          : pr
      )
    );
  const setNotes = (pid: string, notes: string) =>
    setProjects((p) =>
      p.map((pr) => (pr.id === pid ? { ...pr, notes } : pr))
    );

  const undone = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily") {
      const t = completed.daily.find((t) => t.id === id);
      if (!t) return;
      setCompleted((c) => ({ ...c, daily: c.daily.filter((t) => t.id !== id) }));
      setDaily((d) => [...d, { ...t, done: false }]);
    } else if (type === "weekly") {
      const t = completed.weekly.find((t) => t.id === id);
      if (!t) return;
      setCompleted((c) => ({ ...c, weekly: c.weekly.filter((t) => t.id !== id) }));
      setWeekly((w) => [...w, { ...t, lastCompleted: null }]);
    } else {
      const p = completed.projects.find((p) => p.id === id);
      if (!p) return;
      setCompleted((c) => ({ ...c, projects: c.projects.filter((p) => p.id !== id) }));
      setProjects((pr) => [{ ...p, completed: false }, ...pr]);
    }
    setView("projects");
  };
  const restore = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily") {
      const t = deleted.daily.find((t) => t.id === id);
      if (!t) return;
      setDeleted((d) => ({ ...d, daily: d.daily.filter((t) => t.id !== id) }));
      setDaily((d) => [...d, { ...t, done: false }]);
    } else if (type === "weekly") {
      const t = deleted.weekly.find((t) => t.id === id);
      if (!t) return;
      setDeleted((d) => ({ ...d, weekly: d.weekly.filter((t) => t.id !== id) }));
      setWeekly((w) => [...w, { ...t, lastCompleted: null }]);
    } else {
      const p = deleted.projects.find((p) => p.id === id);
      if (!p) return;
      setDeleted((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
      setProjects((pr) => [{ ...p, deleted: false }, ...pr]);
    }
  };
  const purge = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily")
      setDeleted((d) => ({ ...d, daily: d.daily.filter((t) => t.id !== id) }));
    if (type === "weekly")
      setDeleted((d) => ({ ...d, weekly: d.weekly.filter((t) => t.id !== id) }));
    if (type === "projects")
      setDeleted((d) => ({
        ...d,
        projects: d.projects.filter((p) => p.id !== id),
      }));
  };

  return {
    daily,
    weekly,
    scratch,
    projects,
    completed,
    deleted,
    history,
    view,
    isPromptOpen,
    promptLabel,
    promptOnSubmit,
    setScratch,
    setView,
    openPrompt,
    closePrompt,
    newDay,
    addDaily,
    toggleDaily,
    delDaily,
    addWeekly,
    completeWeekly,
    delWeekly,
    addProject,
    delProject,
    completeProject,
    addSubtask,
    toggleSubtask,
    delSubtask,
    addAISubtasks,
    setNotes,
    undone,
    restore,
    purge,
  };
};
