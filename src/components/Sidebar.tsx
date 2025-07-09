import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun, Plus, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { daysAgo } from "../lib/utils";
import { exportAllData, importAllData } from "../lib/storage";
import { RootState } from "../store";
import { setView, setCurrentDay, nextDay, previousDay } from "../store/slices/viewSlice";
import { openPrompt } from "../store/slices/promptSlice";
import { newDay } from "../store/slices/historySlice";
import { addDaily, toggleDaily, delDaily, resetDaily } from "../store/slices/dailySlice";
import { addWeekly, completeWeekly, delWeekly } from "../store/slices/weeklySlice";
import { setScratch } from "../store/slices/scratchSlice";
import { toggleSidebar } from "../store/slices/sidebarSlice";


export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const currentDay = useSelector((state: RootState) => state.view.currentDay);
  const daily = useSelector((state: RootState) => state.daily.daily[currentDay] || []);
  const weekly = useSelector((state: RootState) => state.weekly.weekly);
  const scratch = useSelector((state: RootState) => state.scratch.scratch[currentDay] || '');
  const view = useSelector((state: RootState) => state.view.currentView);
  const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  const fileRef = React.useRef<HTMLInputElement>(null);
  const triggerImport = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) importAllData(f);
  };

  const handleNewDay = () => {
    console.log("handleNewDay called");
    // Archive completed tasks from the *current logical day* to history
    const doneDailyTasks = daily.filter((t) => t.done).map((t) => t.text);
    if (doneDailyTasks.length) {
      dispatch(newDay(doneDailyTasks));
    }

    // Prepare tasks for the *next logical day*: copy current day's tasks and reset their 'done' status
    const tasksForNextLogicalDay = daily.map(task => ({ ...task, done: false }));

    // Calculate the *next logical day's date*
    const currentLogicalDayDate = new Date(currentDay);
    currentLogicalDayDate.setDate(currentLogicalDayDate.getDate() + 1);
    const nextLogicalDayDate = currentLogicalDayDate.toISOString().slice(0, 10);

    // Initialize the daily tasks for the *next logical day*
    dispatch(initializeDailyTasksForDay({ date: nextLogicalDayDate, tasks: tasksForNextLogicalDay }));

    // Advance the *current logical day* in the view slice
    dispatch(setCurrentDay(nextLogicalDayDate));
  };

  const handleDelDaily = (id: string) => {
    const taskToDelete = daily.find((t) => t.id === id);
    if (taskToDelete) {
      dispatch(delDaily({ date: currentDay, id }));
    }
  };

  const handleDelWeekly = (id: string) => {
    const taskToDelete = weekly.find((t) => t.id === id);
    if (taskToDelete) {
      dispatch(delWeekly(id));
    }
  };

  return (
    <aside className={`h-screen bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
      {/* Date and New-Day button */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button onClick={() => dispatch(previousDay())} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">←</button>
          <div className="text-lg font-bold">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <button onClick={() => dispatch(nextDay())} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">→</button>
        </div>
        <button
          onClick={handleNewDay}
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
            onClick={() => dispatch(openPrompt({ label: "Add daily task", onSubmit: (text) => dispatch(addDaily({ date: currentDay, text })) }))}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Plus size={18} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {daily.length === 0 && (
            <li className="text-gray-400 text-sm">None</li>
          )}
          {daily.filter(t => !t.deleted).map((t) => (
            <li
              key={t.id}
              className="flex items-center group hover:bg-gray-50 dark:hover:bg-dark-background rounded px-1"
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => dispatch(toggleDaily({ date: currentDay, id: t.id }))}
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
                onClick={() => handleDelDaily(t.id)}
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
            onClick={() => dispatch(openPrompt({ label: "Add weekly task", onSubmit: (text) => dispatch(addWeekly(text)) }))}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <Plus size={18} />
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {weekly.length === 0 && (
            <li className="text-gray-400 text-sm">None</li>
          )}
          {weekly.filter(t => !t.deleted).map((t) => (
            <li
              key={t.id}
              className="flex items-center group hover:bg-gray-50 dark:hover:bg-dark-background rounded px-1"
            >
              <span className="flex-1 text-sm">{t.text}</span>
              <span className="text-xs text-gray-400 ml-2">
                Last:{" "}
                {t.lastCompleted ? `${daysAgo(t.lastCompleted)}d ago` : "never"}
              </span>
              <button
                onClick={() => dispatch(completeWeekly(t.id))}
                className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
              >
                Done
              </button>
              <button
                onClick={() => handleDelWeekly(t.id)}
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
          onChange={(e) => dispatch(setScratch({ date: currentDay, text: e.target.value }))}
          className="w-full min-h-[60px] max-h-32 border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400 bg-white dark:bg-dark-surface dark:border-gray-600"
        />
      </section>

      {/* Nav buttons */}
      <div className="mt-auto flex flex-col gap-2">
        <button
          onClick={() => dispatch(setView("completed"))}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background text-sm"
        >
          View Completed
        </button>
        <button
          onClick={() => dispatch(setView("deleted"))}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background text-sm"
        >
          View Deleted
        </button>
        <button
          onClick={() => dispatch(setView("review"))}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background text-sm"
        >
          View Daily Review
        </button>
        <button
          onClick={exportAllData}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background text-sm"
        >
          Export Data
        </button>
        <button
          onClick={triggerImport}
          className="text-left px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background text-sm"
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
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-dark-background"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-full bg-gray-200 dark:bg-dark-background"
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
