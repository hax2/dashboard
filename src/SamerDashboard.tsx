import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Wand2 } from "lucide-react";

/* ---------- types ---------- */
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

/* ---------- helpers ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgo = (d: string | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000) : "never";
const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now();

/* ---------- debounce ---------- */
const debounce = (() => {
  const t: Record<string, ReturnType<typeof setTimeout>> = {};
  return (k: string, fn: () => void, ms = 300) => {
    clearTimeout(t[k]);
    t[k] = setTimeout(fn, ms);
  };
})();

/* ---------- storage keys ---------- */
const STORAGE = {
  daily: "samer-daily",
  weekly: "samer-weekly",
  projects: "samer-projects",
  scratch: "samer-scratch",
  completed: "samer-completed",
  deleted: "samer-deleted",
  history: "samer-history",
};

/* ====================================================== */
const SamerDashboard: React.FC = () => {
  /* ---------- state ---------- */
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
    "projects" | "completed" | "deleted" | "review" | { projectId: string }
  >("projects");
  const [prompt, setPrompt] = useState<{
    open: boolean;
    label: string;
    onSubmit: (v: string) => void;
  }>({ open: false, label: "", onSubmit: () => {} });

  /* ---------- load ---------- */
  useEffect(() => {
    const g = (k: keyof typeof STORAGE, s: any) => {
      const v = localStorage.getItem(STORAGE[k]);
      if (v) s(JSON.parse(v));
    };
    g("daily", setDaily);
    g("weekly", setWeekly);
    g("projects", setProjects);
    g("scratch", setScratch);
    g("completed", setCompleted);
    g("deleted", setDeleted);
    g("history", setHistory);
  }, []);

  /* ---------- save (debounced) ---------- */
  useEffect(
    () => debounce("d", () => localStorage.setItem(STORAGE.daily, JSON.stringify(daily))),
    [daily]
  );
  useEffect(
    () => debounce("w", () => localStorage.setItem(STORAGE.weekly, JSON.stringify(weekly))),
    [weekly]
  );
  useEffect(
    () => debounce("p", () => localStorage.setItem(STORAGE.projects, JSON.stringify(projects))),
    [projects]
  );
  useEffect(
    () => debounce("s", () => localStorage.setItem(STORAGE.scratch, scratch)),
    [scratch]
  );
  useEffect(
    () => debounce("c", () => localStorage.setItem(STORAGE.completed, JSON.stringify(completed))),
    [completed]
  );
  useEffect(
    () => debounce("del", () => localStorage.setItem(STORAGE.deleted, JSON.stringify(deleted))),
    [deleted]
  );
  useEffect(
    () => debounce("h", () => localStorage.setItem(STORAGE.history, JSON.stringify(history))),
    [history]
  );

  /* ---------- prompt ---------- */
  const openPrompt = (l: string, cb: (v: string) => void) =>
    setPrompt({ open: true, label: l, onSubmit: cb });
  const closePrompt = () => setPrompt({ open: false, label: "", onSubmit: () => {} });

  /* ---------- daily ---------- */
  const newDay = () => {
    const done = daily.filter(t => t.done);
    if (done.length)
      setHistory(h => [
        { date: todayISO(), tasks: done.map(t => t.text) },
        ...h.filter(e => e.date !== todayISO()),
      ]);
    setDaily(d => d.map(t => ({ ...t, done: false })));
  };
  const addDaily = (t: string) => setDaily(d => [...d, { id: uuid(), text: t, done: false }]);
  const delDaily = (id: string) => {
    const t = daily.find(t => t.id === id);
    if (!t) return;
    setDaily(d => d.filter(t => t.id !== id));
    setDeleted(d => ({ ...d, daily: [t, ...d.daily] }));
  };
  const toggleDaily = (id: string) =>
    setDaily(d => d.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  /* ---------- weekly ---------- */
  const addWeekly = (t: string) =>
    setWeekly(w => [...w, { id: uuid(), text: t, lastCompleted: null }]);
  const delWeekly = (id: string) => {
    const t = weekly.find(t => t.id === id);
    if (!t) return;
    setWeekly(w => w.filter(t => t.id !== id));
    setDeleted(d => ({ ...d, weekly: [t, ...d.weekly] }));
  };
  const completeWeekly = (id: string) => {
    setWeekly(w =>
      w.map(t => (t.id === id ? { ...t, lastCompleted: todayISO() } : t))
    );
    const t = weekly.find(t => t.id === id);
    if (t) setCompleted(c => ({ ...c, weekly: [t, ...c.weekly] }));
  };

  /* ---------- scratch ---------- */
  const changeScratch = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setScratch(e.target.value);

  /* ---------- projects ---------- */
  const addProject = (t: string) =>
    setProjects(p => [
      { id: uuid(), title: t, completed: false, deleted: false, subtasks: [], notes: "" },
      ...p,
    ]);
  const delProject = (id: string) => {
    const p = projects.find(p => p.id === id);
    if (!p) return;
    setProjects(pr => pr.filter(p => p.id !== id));
    setDeleted(d => ({ ...d, projects: [p, ...d.projects] }));
    if (typeof view === "object" && view.projectId === id) setView("projects");
  };
  const completeProject = (id: string) => {
    setProjects(pr => pr.map(p => (p.id === id ? { ...p, completed: true } : p)));
    const p = projects.find(p => p.id === id);
    if (p) setCompleted(c => ({ ...c, projects: [p, ...c.projects] }));
  };
  const addSubtask = (pid: string, txt: string) =>
    setProjects(pr =>
      pr.map(p =>
        p.id === pid
          ? { ...p, subtasks: [...p.subtasks, { id: uuid(), text: txt, done: false }] }
          : p
      )
    );
  const delSubtask = (pid: string, sid: string) =>
    setProjects(pr =>
      pr.map(p =>
        p.id === pid ? { ...p, subtasks: p.subtasks.filter(s => s.id !== sid) } : p
      )
    );
  const toggleSubtask = (pid: string, sid: string) =>
    setProjects(pr =>
      pr.map(p =>
        p.id === pid
          ? {
              ...p,
              subtasks: p.subtasks.map(s =>
                s.id === sid ? { ...s, done: !s.done } : s
              ),
            }
          : p
      )
    );
  const addAISubtasks = (pid: string) =>
    setProjects(pr =>
      pr.map(p =>
        p.id === pid
          ? {
              ...p,
              subtasks: [
                ...p.subtasks,
                ...["Research", "Outline", "Draft", "Review", "Finalize"]
                  .filter(t => !p.subtasks.some(s => s.text === t))
                  .map(t => ({ id: uuid(), text: t, done: false })),
              ],
            }
          : p
      )
    );
  const setNotes = (pid: string, n: string) =>
    setProjects(pr => pr.map(p => (p.id === pid ? { ...p, notes: n } : p)));

  /* ---------- undo / restore / purge ---------- */
  const undone = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily") {
      const t = completed.daily.find(t => t.id === id);
      if (!t) return;
      setCompleted(c => ({ ...c, daily: c.daily.filter(t => t.id !== id) }));
      setDaily(d => [...d, { ...t, done: false }]);
    } else if (type === "weekly") {
      const t = completed.weekly.find(t => t.id === id);
      if (!t) return;
      setCompleted(c => ({ ...c, weekly: c.weekly.filter(t => t.id !== id) }));
      setWeekly(w => [...w, { ...t, lastCompleted: null }]);
    } else {
      const p = completed.projects.find(p => p.id === id);
      if (!p) return;
      setCompleted(c => ({ ...c, projects: c.projects.filter(p => p.id !== id) }));
      setProjects(pr => [{ ...p, completed: false }, ...pr]);
    }
    setView("projects");
  };
  const restore = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily") {
      const t = deleted.daily.find(t => t.id === id);
      if (!t) return;
      setDeleted(d => ({ ...d, daily: d.daily.filter(t => t.id !== id) }));
      setDaily(d => [...d, { ...t, done: false }]);
    } else if (type === "weekly") {
      const t = deleted.weekly.find(t => t.id === id);
      if (!t) return;
      setDeleted(d => ({ ...d, weekly: d.weekly.filter(t => t.id !== id) }));
      setWeekly(w => [...w, { ...t, lastCompleted: null }]);
    } else {
      const p = deleted.projects.find(p => p.id === id);
      if (!p) return;
      setDeleted(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
      setProjects(pr => [{ ...p, deleted: false }, ...pr]);
    }
  };
  const purge = (type: "daily" | "weekly" | "projects", id: string) => {
    if (type === "daily")
      setDeleted(d => ({ ...d, daily: d.daily.filter(t => t.id !== id) }));
    if (type === "weekly")
      setDeleted(d => ({ ...d, weekly: d.weekly.filter(t => t.id !== id) }));
    if (type === "projects")
      setDeleted(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
  };

  /* ---------- prompt modal ---------- */
  const Prompt = () =>
    prompt.open ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-6 w-80 rounded-xl shadow-lg flex flex-col gap-4">
          <label className="font-medium text-gray-700">{prompt.label}</label>
          <input
            autoFocus
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            onKeyDown={e => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                prompt.onSubmit((e.target as HTMLInputElement).value.trim());
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
          </div>
        </div>
      </div>
    ) : null;

  /* ---------- views ---------- */
  const ProjectsView = () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => openPrompt("Add project", addProject)}
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.filter(p => !p.completed && !p.deleted).length === 0 && (
          <div className="text-gray-400">No active projects</div>
        )}
        {projects
          .filter(p => !p.completed && !p.deleted)
          .map(p => {
            const open = p.subtasks.filter(s => !s.done);
            return (
              <div
                key={p.id}
                className="bg-white border rounded-xl p-4 flex flex-col gap-2 shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <button
                    className="text-lg font-semibold text-blue-700 hover:underline text-left"
                    onClick={() => setView({ projectId: p.id })}
                  >
                    {p.title}
                  </button>
                  <button
                    className="opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                    onClick={() => delProject(p.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="text-sm">
                  {open.length} open {open.length === 1 ? "subtask" : "subtasks"}
                </div>
                <ul className="flex flex-col gap-1">
                  {open.slice(0, 3).map(s => (
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
                  className="self-start px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                  onClick={() => completeProject(p.id)}
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
    const p = projects.find(p => p.id === projectId);
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

        {/* subtasks */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Subtasks</span>
            <button
              onClick={() => openPrompt("Add subtask", t => addSubtask(p.id, t))}
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
            {p.subtasks.map(s => (
              <li key={s.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={() => toggleSubtask(p.id, s.id)}
                  className="mr-2 accent-blue-600"
                />
                <span className={`flex-1 text-sm ${s.done ? "line-through text-gray-400" : ""}`}>
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

        {/* notes */}
        <section>
          <div className="font-semibold mb-1">Project Notes</div>
          <textarea
            value={p.notes}
            onChange={e => setNotes(p.id, e.target.value)}
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

      {/* sections */}
      {(["daily", "weekly", "projects"] as const).map(type => (
        <section key={type}>
          <div className="font-semibold mb-1 capitalize">{type}</div>
          <ul className="flex flex-col gap-1">
            {(completed as any)[type].length === 0 && (
              <li className="text-gray-400 text-sm">Nothing</li>
            )}
            {(completed as any)[type].map((item: any) => (
              <li key={item.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
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

      {(["daily", "weekly", "projects"] as const).map(type => (
        <section key={type}>
          <div className="font-semibold mb-1 capitalize">{type}</div>
          <ul className="flex flex-col gap-1">
            {(deleted as any)[type].length === 0 && (
              <li className="text-gray-400 text-sm">Empty</li>
            )}
            {(deleted as any)[type].map((item: any) => (
              <li key={item.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
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
        {history.length === 0 && <li className="text-gray-400">No entries</li>}
        {history.map(h => (
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

  /* ---------- sidebar ---------- */
  const Sidebar = () => (
    <aside className="w-80 h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
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

      {/* daily */}
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
          {daily.length === 0 && <li className="text-gray-400 text-sm">None</li>}
          {daily.map(t => (
            <li key={t.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleDaily(t.id)}
                className="mr-2 accent-blue-600"
              />
              <span className={`flex-1 text-sm ${t.done ? "line-through text-gray-400" : ""}`}>
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

      {/* weekly */}
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
          {weekly.length === 0 && <li className="text-gray-400 text-sm">None</li>}
          {weekly.map(t => (
            <li key={t.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
              <span className="flex-1 text-sm">{t.text}</span>
              <span className="text-xs text-gray-400 ml-2">
                Last: {t.lastCompleted ? `${daysAgo(t.lastCompleted)}d ago` : "never"}
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

      {/* scratchpad */}
      <section>
        <div className="font-semibold mb-1">Scratchpad</div>
        <textarea
          value={scratch}
          onChange={changeScratch}
          placeholder="Quick notes..."
          className="w-full min-h-[60px] max-h-32 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
        />
      </section>

      {/* nav */}
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
      </div>
    </aside>
  );

  /* ---------- main switch ---------- */
  let Main: React.ReactNode;
  if (view === "projects") Main = <ProjectsView />;
  else if (view === "completed") Main = <CompletedView />;
  else if (view === "deleted") Main = <DeletedView />;
  else if (view === "review") Main = <ReviewView />;
  else Main = <ProjectDetailView projectId={view.projectId} />;

  /* ---------- render ---------- */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{Main}</main>
      <Prompt />
    </div>
  );
};

export default SamerDashboard;
