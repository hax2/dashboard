import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ArrowLeft, Wand2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*                               Types                                */
/* ------------------------------------------------------------------ */
interface Task {
  id: string;
  text: string;
  done: boolean;
}
interface WeeklyTask {
  id: string;
  text: string;
  lastCompleted: string | null;
}
interface Project {
  id: string;
  title: string;
  completed: boolean;
  deleted: boolean;
  subtasks: Task[];
  notes: string;
}
interface DailyHistoryEntry {
  date: string;
  tasks: string[];
}

/* ------------------------------------------------------------------ */
/*                              Helpers                               */
/* ------------------------------------------------------------------ */
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgo = (d: string | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000) : "never";
const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now();

/* ------------------------- Debounce helper ------------------------ */
const debounce = (() => {
  const t: Record<string, ReturnType<typeof setTimeout>> = {};
  return (k: string, fn: () => void, ms = 300) => {
    clearTimeout(t[k]);
    t[k] = setTimeout(fn, ms);
  };
})();

/* --------------------------- Storage map -------------------------- */
const STORAGE = {
  daily: "samer-daily-tasks",
  weekly: "samer-weekly-tasks",
  projects: "samer-projects",
  scratch: "samer-scratchpad",
  completed: "samer-completed",
  deleted: "samer-deleted",
  history: "samer-daily-history",
} as const;
const STORAGE_KEYS = Object.values(STORAGE);

/* -------------------------- Backup helpers ------------------------ */
const exportAllData = () => {
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

const importAllData = (file: File) => {
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

/* ================================================================== */
/*                            Component                               */
/* ================================================================== */
const SamerDashboard: React.FC = () => {
  /* ----------------------------- State ---------------------------- */
  const [daily, setDaily] = useState<Task[]>([]);
  const [weekly, setWeekly] = useState<WeeklyTask[]>([]);
  const [scratch, setScratch] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [completed, setCompleted] = useState<{
    daily: Task[];
    weekly: WeeklyTask[];
    projects: Project[];
  }>({ daily: [], weekly: [], projects: [] });
  const [deleted, setDeleted] = useState<{
    daily: Task[];
    weekly: WeeklyTask[];
    projects: Project[];
  }>({ daily: [], weekly: [], projects: [] });
  const [history, setHistory] = useState<DailyHistoryEntry[]>([]);
  const [view, setView] = useState<
    | "projects"
    | "completed"
    | "deleted"
    | "review"
    | { projectId: string }
  >("projects");
  const [prompt, setPrompt] = useState<{
    open: boolean;
    label: string;
    onSubmit: (v: string) => void;
  }>({ open: false, label: "", onSubmit: () => {} });

  /* ---------------------- File-import helpers --------------------- */
  const fileRef = useRef<HTMLInputElement>(null);
  const triggerImport = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) importAllData(f);
  };

  /* ------------------------- LocalStorage I/O --------------------- */
  useEffect(() => {
    const load = <K extends keyof typeof STORAGE>(
      key: K,
      setter: (v: any) => void
    ) => {
      const v = localStorage.getItem(STORAGE[key]);
      if (v) setter(JSON.parse(v));
    };
    load("daily", setDaily);
    load("weekly", setWeekly);
    load("projects", setProjects);
    load("scratch", setScratch);
    load("completed", setCompleted);
    load("deleted", setDeleted);
    load("history", setHistory);
  }, []);

  useEffect(
    () =>
      debounce("d", () =>
        localStorage.setItem(STORAGE.daily, JSON.stringify(daily))
      ),
    [daily]
  );
  useEffect(
    () =>
      debounce("w", () =>
        localStorage.setItem(STORAGE.weekly, JSON.stringify(weekly))
      ),
    [weekly]
  );
  useEffect(
    () =>
      debounce("p", () =>
        localStorage.setItem(STORAGE.projects, JSON.stringify(projects))
      ),
    [projects]
  );
  useEffect(
    () =>
      debounce("s", () => localStorage.setItem(STORAGE.scratch, scratch)),
    [scratch]
  );
  useEffect(
    () =>
      debounce("c", () =>
        localStorage.setItem(STORAGE.completed, JSON.stringify(completed))
      ),
    [completed]
  );
  useEffect(
    () =>
      debounce("del", () =>
        localStorage.setItem(STORAGE.deleted, JSON.stringify(deleted))
      ),
    [deleted]
  );
  useEffect(
    () =>
      debounce("h", () =>
        localStorage.setItem(STORAGE.history, JSON.stringify(history))
      ),
    [history]
  );

  /* --------------------------- Prompt ----------------------------- */
  const openPrompt = (label: string, onSubmit: (v: string) => void) =>
    setPrompt({ open: true, label, onSubmit });
  const closePrompt = () =>
    setPrompt({ open: false, label: "", onSubmit: () => {} });

  const Prompt = () => {
    const [val, setVal] = useState("");
    useEffect(() => {
      if (prompt.open) setVal("");
    }, [prompt.open]);
    if (!prompt.open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-6 w-80 rounded-xl shadow-lg flex flex-col gap-4">
          <label className="font-medium text-gray-700">{prompt.label}</label>
          <input
            autoFocus
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && val.trim()) {
                prompt.onSubmit(val.trim());
                closePrompt();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={closePrompt}
            >
              Cancel
            </button>
            <button
              disabled={!val.trim()}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (val.trim()) {
                  prompt.onSubmit(val.trim());
                  closePrompt();
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------ CRUD: Daily / Weekly helpers ---------------- */
  // Daily
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

  // Weekly
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

  /* ------------------ CRUD: Projects + subtasks ------------------ */
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

  // Subtasks
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

  /* --------------- Undo / Restore / Permanent delete ------------- */
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

  /* ------------------------------------------------------------------ */
  /*                              Views                                 */
  /* ------------------------------------------------------------------ */
  const ProjectsView = () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={() => openPrompt("Add project", addProject)}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.filter((p) => !p.completed && !p.deleted).length === 0 && (
          <div className="text-gray-400">No active projects</div>
        )}
        {projects
          .filter((p) => !p.completed && !p.deleted)
          .map((p) => {
            const open = p.subtasks.filter((s) => !s.done);
            return (
              <div
                key={p.id}
                className="bg-white border rounded-xl p-4 flex flex-col gap-2 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setView({ projectId: p.id })}
                    className="text-lg font-semibold text-blue-700 hover:underline text-left"
                  >
                    {p.title}
                  </button>
                  <button
                    onClick={() => delProject(p.id)}
                    className="opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-sm">{open.length} open subtasks</div>
                <ul className="flex flex-col gap-1">
                  {open.slice(0, 3).map((s) => (
                    <li key={s.id} className="text-sm truncate">
                      • {s.text}
                    </li>
                  ))}
                  {open.length > 3 && (
                    <li className="text-xs text-gray-400">
                      +{open.length - 3} more
                    </li>
                  )}
                </ul>
                <button
                  onClick={() => completeProject(p.id)}
                  className="self-start px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                >
                  Done
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );

  const ProjectDetailView = ({ projectId }: { projectId: string }) => {
    const p = projects.find((p) => p.id === projectId);
    if (!p)
      return (
        <div className="p-6">
          <button
            onClick={() => setView("projects")}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 mb-4"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="text-gray-400">Project not found.</div>
        </div>
      );
    return (
      <div className="flex flex-col gap-6 p-6">
        <button
          onClick={() => setView("projects")}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-bold">{p.title}</h2>

        {/* Subtasks */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Subtasks</span>
            <button
              onClick={() =>
                openPrompt("Add subtask", (t) => addSubtask(p.id, t))
              }
              className="p-1 text-gray-400 hover:text-blue-600"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => addAISubtasks(p.id)}
              className="p-1 text-gray-400 hover:text-purple-600"
            >
              <Wand2 size={18} />
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {p.subtasks.length === 0 && (
              <li className="text-gray-400">No subtasks</li>
            )}
            {p.subtasks.map((s) => (
              <li
                key={s.id}
                className="flex items-center group hover:bg-gray-50 rounded px-1"
              >
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={() => toggleSubtask(p.id, s.id)}
                  className="mr-2 accent-blue-600"
                />
                <span
                  className={`flex-1 text-sm ${
                    s.done ? "line-through text-gray-400" : ""
                  }`}
                >
                  {s.text}
                </span>
                <button
                  onClick={() => delSubtask(p.id, s.id)}
                  className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Notes */}
        <section>
          <div className="font-semibold mb-1">Project Notes</div>
          <textarea
            value={p.notes}
            onChange={(e) => setNotes(p.id, e.target.value)}
            className="w-full min-h-[60px] max-h-32 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
          />
        </section>
      </div>
    );
  };

  const CompletedView = () => (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => setView("projects")}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Completed</h2>

      {(["daily", "weekly", "projects"] as const).map((type) => (
        <section key={type}>
          <div className="font-semibold mb-1 capitalize">{type}</div>
          <ul className="flex flex-col gap-1">
            {(completed as any)[type].length === 0 && (
              <li className="text-gray-400 text-sm">Empty</li>
            )}
            {(completed as any)[type].map((item: any) => (
              <li
                key={item.id}
                className="flex items-center group hover:bg-gray-50 rounded px-1"
              >
                <span className="flex-1 text-sm line-through text-gray-400">
                  {type === "projects" ? item.title : item.text}
                </span>
                <button
                  onClick={() => undone(type, item.id)}
                  className="ml-2 px-2 py-0.5 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs"
                >
                  Undone
                </button>
                <button
                  onClick={() => purge(type, item.id)}
                  className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  const DeletedView = () => (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => setView("projects")}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Trash</h2>

      {(["daily", "weekly", "projects"] as const).map((type) => (
        <section key={type}>
          <div className="font-semibold mb-1 capitalize">{type}</div>
          <ul className="flex flex-col gap-1">
            {(deleted as any)[type].length === 0 && (
              <li className="text-gray-400 text-sm">Empty</li>
            )}
            {(deleted as any)[type].map((item: any) => (
              <li
                key={item.id}
                className="flex items-center group hover:bg-gray-50 rounded px-1"
              >
                <span className="flex-1 text-sm line-through text-gray-400">
                  {type === "projects" ? item.title : item.text}
                </span>
                <button
                  onClick={() => restore(type, item.id)}
                  className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                >
                  Restore
                </button>
                <button
                  onClick={() => purge(type, item.id)}
                  className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

  const ReviewView = () => (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => setView("projects")}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Daily Review</h2>
      <ul className="flex flex-col gap-4">
        {history.length === 0 && (
          <li className="text-gray-400 text-sm">No entries</li>
        )}
        {history.map((h) => (
          <li key={h.date} className="bg-white border rounded-xl p-4">
            <div className="font-semibold mb-2">
              {new Date(h.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            <ul className="flex flex-col gap-1">
              {h.tasks.map((t, i) => (
                <li key={i} className="text-sm line-through text-gray-400">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );

  /* ------------------------------------------------------------------ */
  /*                             Sidebar                                */
  /* ------------------------------------------------------------------ */
  const Sidebar = () => (
    <aside className="w-80 h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
      {/* Date and New-Day button */}
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
        <button
          onClick={newDay}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          New Day
        </button>
      </div>

      {/* Daily tasks */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Daily Tasks</span>
          <button
            onClick={() => openPrompt("Add daily task", addDaily)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Plus size={18} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {daily.length === 0 && (
            <li className="text-gray-400 text-sm">None</li>
          )}
          {daily.map((t) => (
            <li
              key={t.id}
              className="flex items-center group hover:bg-gray-50 rounded px-1"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleDaily(t.id)}
                className="mr-2 accent-blue-600"
              />
              <span
                className={`flex-1 text-sm ${
                  t.done ? "line-through text-gray-400" : ""
                }`}
              >
                {t.text}
              </span>
              <button
                onClick={() => delDaily(t.id)}
                className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly tracker */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Weekly Tracker</span>
          <button
            onClick={() => openPrompt("Add weekly task", addWeekly)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Plus size={18} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {weekly.length === 0 && (
            <li className="text-gray-400 text-sm">None</li>
          )}
          {weekly.map((t) => (
            <li
              key={t.id}
              className="flex items-center group hover:bg-gray-50 rounded px-1"
            >
              <span className="flex-1 text-sm">{t.text}</span>
              <span className="text-xs text-gray-400 ml-2">
                Last:{" "}
                {t.lastCompleted ? `${daysAgo(t.lastCompleted)}d ago` : "never"}
              </span>
              <button
                onClick={() => completeWeekly(t.id)}
                className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
              >
                Done
              </button>
              <button
                onClick={() => delWeekly(t.id)}
                className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Scratchpad */}
      <section>
        <div className="font-semibold mb-1">Scratchpad</div>
        <textarea
          placeholder="Quick notes..."
          value={scratch}
          onChange={(e) => setScratch(e.target.value)}
          className="w-full min-h-[60px] max-h-32 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
        />
      </section>

      {/* Nav buttons */}
      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => setView("completed")}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          View Completed
        </button>
        <button
          onClick={() => setView("deleted")}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          View Deleted
        </button>
        <button
          onClick={() => setView("review")}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          View Daily Review
        </button>
        <button
          onClick={exportAllData}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Export Data
        </button>
        <button
          onClick={triggerImport}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Import Data
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </aside>
  );

  /* ------------------------------------------------------------------ */
  /*                   Main-area routing switch                         */
  /* ------------------------------------------------------------------ */
  let Main: React.ReactNode;
  if (view === "projects") Main = <ProjectsView />;
  else if (view === "completed") Main = <CompletedView />;
  else if (view === "deleted") Main = <DeletedView />;
  else if (view === "review") Main = <ReviewView />;
  else Main = <ProjectDetailView projectId={view.projectId} />;

  /* ----------------------------- Render ---------------------------- */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{Main}</main>
      <Prompt />
    </div>
  );
};

export default SamerDashboard;
