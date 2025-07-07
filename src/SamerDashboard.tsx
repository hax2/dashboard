tsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, Wand2 } from "lucide-react";

/* ---------- Types ---------- */
interface Task {
  id: string;
  text: string;
  done: boolean;
}
interface WeeklyTask {
  id: string;
  text: string;
  lastCompleted: string | null; // ISO date string or null
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
  date: string;         // ISO date
  tasks: string[];      // completed task texts
}

/* ---------- Helpers ---------- */
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgo = (date: string | null) => {
  if (!date) return "never";
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
};
const uuid = () => Math.random().toString(36).slice(2, 10) + Date.now();

/* ---------- Debounce (per-key, 300 ms) ---------- */
const debounce = (() => {
  const timers: Record<string, ReturnType<typeof setTimeout>> = {};
  return (key: string, fn: () => void, delay = 300) => {
    clearTimeout(timers[key]);
    timers[key] = setTimeout(fn, delay);
  };
})();

/* ---------- Storage keys ---------- */
const STORAGE_KEYS = {
  daily: "samer-daily-tasks",
  weekly: "samer-weekly-tasks",
  projects: "samer-projects",
  scratch: "samer-scratchpad",
  completed: "samer-completed",
  deleted: "samer-deleted",
  dailyHistory: "samer-daily-history",
};

/* ===================================================
                       Component
   =================================================== */
const SamerDashboard: React.FC = () => {
  /* ---------- State ---------- */
  const [dailyTasks, setDailyTasks]           = useState<Task[]>([]);
  const [weeklyTasks, setWeeklyTasks]         = useState<WeeklyTask[]>([]);
  const [scratchpad,  setScratchpad]          = useState("");
  const [projects,    setProjects]            = useState<Project[]>([]);
  const [completed,   setCompleted]           = useState<{ daily: Task[]; weekly: WeeklyTask[]; projects: Project[] }>({ daily: [], weekly: [], projects: [] });
  const [deleted,     setDeleted]             = useState<{ daily: Task[]; weekly: WeeklyTask[]; projects: Project[] }>({ daily: [], weekly: [], projects: [] });
  const [dailyHistory,setDailyHistory]        = useState<DailyHistoryEntry[]>([]);
  const [view, setView] = useState<"projects"|"completed"|"deleted"|"dailyReview"|{ projectId: string }>("projects");
  const [prompt,setPrompt] = useState<{open:boolean;label:string;onSubmit:(v:string)=>void}>({ open:false,label:"",onSubmit:()=>{} });

  /* ---------- Load from localStorage on mount ---------- */
  useEffect(() => {
    const load = (key: keyof typeof STORAGE_KEYS, setter: any) => {
      const val = localStorage.getItem(STORAGE_KEYS[key]);
      if (val) setter(JSON.parse(val));
    };
    load("daily",        setDailyTasks);
    load("weekly",       setWeeklyTasks);
    load("projects",     setProjects);
    load("scratch",      setScratchpad);
    load("completed",    setCompleted);
    load("deleted",      setDeleted);
    load("dailyHistory", setDailyHistory);
  }, []);

  /* ---------- Persist to localStorage (debounced) ---------- */
  useEffect(() => {
    debounce("daily", () =>
      localStorage.setItem(STORAGE_KEYS.daily, JSON.stringify(dailyTasks)));
  }, [dailyTasks]);

  useEffect(() => {
    debounce("weekly", () =>
      localStorage.setItem(STORAGE_KEYS.weekly, JSON.stringify(weeklyTasks)));
  }, [weeklyTasks]);

  useEffect(() => {
    debounce("projects", () =>
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects)));
  }, [projects]);

  useEffect(() => {
    debounce("scratch", () =>
      localStorage.setItem(STORAGE_KEYS.scratch, scratchpad));
  }, [scratchpad]);

  useEffect(() => {
    debounce("completed", () =>
      localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(completed)));
  }, [completed]);

  useEffect(() => {
    debounce("deleted", () =>
      localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(deleted)));
  }, [deleted]);

  useEffect(() => {
    debounce("dailyHistory", () =>
      localStorage.setItem(STORAGE_KEYS.dailyHistory, JSON.stringify(dailyHistory)));
  }, [dailyHistory]);

  /* ---------- Prompt helpers ---------- */
  const openPrompt  = (label:string,onSubmit:(v:string)=>void) => setPrompt({ open:true,label,onSubmit });
  const closePrompt = () => setPrompt({ open:false,label:"",onSubmit:()=>{} });

  /* ---------- Daily ---------- */
  const handleNewDay = () => {
    const done = dailyTasks.filter(t=>t.done);
    if (done.length)
      setDailyHistory(prev=>[
        { date:todayISO(), tasks:done.map(t=>t.text) },
        ...prev.filter(e=>e.date!==todayISO()),
      ]);
    setDailyTasks(prev=>prev.map(t=>({ ...t, done:false })));
  };
  const handleAddDaily    = (text:string) => setDailyTasks(p=>[...p,{id:uuid(),text,done:false}]);
  const handleDeleteDaily = (id:string)  => {
    const t = dailyTasks.find(t=>t.id===id); if(!t) return;
    setDailyTasks(p=>p.filter(t=>t.id!==id));
    setDeleted    (p=>({ ...p, daily:[t,...p.daily] }));
  };
  const handleToggleDaily = (id:string)  =>
    setDailyTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));

  /* ---------- Weekly ---------- */
  const handleAddWeekly     = (txt:string) => setWeeklyTasks(p=>[...p,{id:uuid(),text:txt,lastCompleted:null}]);
  const handleDeleteWeekly  = (id:string)  => {
    const t=weeklyTasks.find(t=>t.id===id); if(!t) return;
    setWeeklyTasks(p=>p.filter(t=>t.id!==id));
    setDeleted(p=>({ ...p, weekly:[t,...p.weekly]}));
  };
  const handleCompleteWeekly= (id:string)  => {
    setWeeklyTasks(p=>p.map(t=>t.id===id?{...t,lastCompleted:todayISO()}:t));
    const t=weeklyTasks.find(t=>t.id===id); if(t) setCompleted(p=>({...p,weekly:[t,...p.weekly]}));
  };

  /* ---------- Scratchpad ---------- */
  const handleScratchChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => setScratchpad(e.target.value);

  /* ---------- Projects ---------- */
  const handleAddProject = (title:string) =>
    setProjects(p=>[{ id:uuid(),title,completed:false,deleted:false,subtasks:[],notes:"" },...p]);
  const handleDeleteProject = (id:string)=> {
    const proj=projects.find(p=>p.id===id); if(!proj) return;
    setProjects(p=>p.filter(pr=>pr.id!==id));
    setDeleted (p=>({...p,projects:[proj,...p.projects]}));
    if(typeof view==="object"&&view.projectId===id) setView("projects");
  };
  const handleCompleteProject = (id:string) => {
    setProjects(p=>p.map(pr=>pr.id===id?{...pr,completed:true}:pr));
    const proj=projects.find(p=>p.id===id); if(proj) setCompleted(p=>({...p,projects:[proj,...p.projects]}));
  };
  const handleAddSubtask = (pid:string,txt:string) =>
    setProjects(p=>p.map(pr=>pr.id===pid?{...pr,subtasks:[...pr.subtasks,{id:uuid(),text:txt,done:false}]}:pr));
  const handleDeleteSubtask = (pid:string,sid:string)=>
    setProjects(p=>p.map(pr=>pr.id===pid?{...pr,subtasks:pr.subtasks.filter(s=>s.id!==sid)}:pr));
  const handleToggleSubtask = (pid:string,sid:string)=>
    setProjects(p=>p.map(pr=>pr.id===pid?{...pr,subtasks:pr.subtasks.map(s=>s.id===sid?{...s,done:!s.done}:s)}:pr));
  const handleAddAISubtasks = (pid:string)=>{
    const ai=["Research","Outline","Draft","Review","Finalize"];
    setProjects(p=>p.map(pr=>pr.id===pid?{
      ...pr,
      subtasks:[
        ...pr.subtasks,
        ...ai.filter(t=>!pr.subtasks.some(s=>s.text===t)).map(t=>({id:uuid(),text:t,done:false}))
      ]
    }:pr));
  };
  const handleProjectNotes  = (pid:string,n:string)=>
    setProjects(p=>p.map(pr=>pr.id===pid?{...pr,notes:n}:pr));

  /* ---------- Undone / Restore / Permanent delete ---------- */
  const handleUndone = (type:"daily"|"weekly"|"projects",id:string)=>{
    if(type==="daily"){
      const t=completed.daily.find(t=>t.id===id); if(!t) return;
      setCompleted(p=>({...p,daily:p.daily.filter(t=>t.id!==id)}));
      setDailyTasks(p=>[...p,{...t,done:false}]);
    }else if(type==="weekly"){
      const t=completed.weekly.find(t=>t.id===id); if(!t) return;
      setCompleted(p=>({...p,weekly:p.weekly.filter(t=>t.id!==id)}));
      setWeeklyTasks(p=>[...p,{...t,lastCompleted:null}]);
    }else{
      const pr=completed.projects.find(pr=>pr.id===id); if(!pr) return;
      setCompleted(p=>({...p,projects:p.projects.filter(pr=>pr.id!==id)}));
      setProjects(p=>[{...pr,completed:false},...p]);
    }
    setView("projects");
  };
  const handleRestore= (type:"daily"|"weekly"|"projects",id:string)=>{
    if(type==="daily"){
      const t=deleted.daily.find(t=>t.id===id); if(!t)return;
      setDeleted(p=>({...p,daily:p.daily.filter(t=>t.id!==id)}));
      setDailyTasks(p=>[...p,{...t,done:false}]);
    }else if(type==="weekly"){
      const t=deleted.weekly.find(t=>t.id===id); if(!t)return;
      setDeleted(p=>({...p,weekly:p.weekly.filter(t=>t.id!==id)}));
      setWeeklyTasks(p=>[...p,{...t,lastCompleted:null}]);
    }else{
      const pr=deleted.projects.find(pr=>pr.id===id); if(!pr)return;
      setDeleted(p=>({...p,projects:p.projects.filter(pr=>pr.id!==id)}));
      setProjects(p=>[{...pr,deleted:false},...p]);
    }
  };
  const handlePermanentDelete=(type:"daily"|"weekly"|"projects",id:string)=>{
    if(type==="daily")   setDeleted(p=>({...p,daily:p.daily.filter(t=>t.id!==id)}));
    if(type==="weekly")  setDeleted(p=>({...p,weekly:p.weekly.filter(t=>t.id!==id)}));
    if(type==="projects")setDeleted(p=>({...p,projects:p.projects.filter(pr=>pr.id!==id)}));
  };

  /* ---------- Prompt modal ---------- */
  const PromptModal=()=>{
    const [val,setVal]=useState("");
    useEffect(()=>{ if(prompt.open) setVal(""); },[prompt.open]);
    if(!prompt.open) return null;
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-6 w-80 rounded-xl shadow-lg flex flex-col gap-4">
          <label className="font-medium text-gray-700">{prompt.label}</label>
          <input
            autoFocus
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={val}
            onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>{
              if(e.key==="Enter" && val.trim()){
                prompt.onSubmit(val.trim()); closePrompt();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={closePrompt}
            >Cancel</button>
            <button
              disabled={!val.trim()}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
              onClick={()=>{ if(val.trim()){ prompt.onSubmit(val.trim());closePrompt(); } }}
            >Add</button>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Sidebar ---------- */
  const Sidebar=()=>(
    <aside className="w-80 h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
      {/* Date & New Day */}
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">
          {new Date().toLocaleDateString(undefined,{ weekday:"long",month:"short",day:"numeric" })}
        </div>
        <button
          onClick={handleNewDay}
          className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
        >New Day</button>
      </div>

      {/* Daily tasks */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Daily Tasks</span>
          <button aria-label="Add" className="p-1 text-gray-400 hover:text-blue-600"
            onClick={()=>openPrompt("Add daily task",handleAddDaily)}>
            <Plus size={18}/>
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {dailyTasks.length===0 && <li className="text-sm text-gray-400">No daily tasks</li>}
          {dailyTasks.map(t=>(
            <li key={t.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
              <input type="checkbox" className="mr-2 accent-blue-600"
                checked={t.done} onChange={()=>handleToggleDaily(t.id)}/>
              <span className={`flex-1 text-sm ${t.done?"line-through text-gray-400":"text-gray-800"}`}>{t.text}</span>
              <button aria-label="Delete" className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500 transition"
                onClick={()=>handleDeleteDaily(t.id)}>
                <Trash2 size={16}/>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Weekly tasks */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">Weekly Tracker</span>
          <button aria-label="Add" className="p-1 text-gray-400 hover:text-blue-600"
            onClick={()=>openPrompt("Add weekly task",handleAddWeekly)}>
            <Plus size={18}/>
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {weeklyTasks.length===0 && <li className="text-sm text-gray-400">No weekly tasks</li>}
          {weeklyTasks.map(t=>(
            <li key={t.id} className="flex items-center group hover:bg-gray-50 rounded px-1">
              <span className="flex-1 text-sm">{t.text}</span>
              <span className="text-xs text-gray-400 ml-2">Last: {t.lastCompleted?`${daysAgo(t.lastCompleted)}d ago`:"never"}</span>
              <button className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
                onClick={()=>handleCompleteWeekly(t.id)}>Done</button>
              <button aria-label="Delete" className="ml-2 opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500 transition"
                onClick={()=>handleDeleteWeekly(t.id)}>
                <Trash2 size={16}/>
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
          className="w-full min-h-[60px] max-h-32 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={scratchpad} onChange={handleScratchChange}
        />
      </section>

      {/* Navigation */}
      <div className="mt-auto flex flex-col gap-2">
        <button onClick={()=>setView("completed")} className="text-left px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
          View Completed Tasks</button>
        <button onClick={()=>setView("deleted")}   className="text-left px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
          View Deleted Tasks</button>
        <button onClick={()=>setView("dailyReview")} className="text-left px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
          View Daily Review</button>
      </div>
    </aside>
  );

  /* ---------- (Projects, Detail, Completed, Deleted, Review views) ---------- */
  /* -- These match functionality from your original file; unchanged except for debounce above -- */
  /* -- Full definitions omitted here strictly for brevity; they remain identical to your original code. -- */

  /* ---------- Main Switch ---------- */
  let MainContent:React.ReactNode;
  if(view==="projects")      MainContent=<ProjectsView/>;
  else if(view==="completed")MainContent=<CompletedTasksView/>;
  else if(view==="deleted")  MainContent=<DeletedTasksView/>;
  else if(view==="dailyReview")MainContent=<DailyReviewView/>;
  else if(typeof view==="object"&&"projectId" in view) MainContent=<ProjectDetailView projectId={view.projectId}/>;

  /* ---------- Render ---------- */
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
      <main className="flex-1 overflow-y-auto">{MainContent}</main>
      <PromptModal/>
    </div>
  );
};

export default SamerDashboard;
