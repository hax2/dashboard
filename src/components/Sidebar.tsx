import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Moon, Sun, Plus, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { daysAgo } from "../lib/utils";
import { exportAllData, importAllData } from "../lib/storage";
import { RootState } from "../store";
import { setView } from "../store/slices/viewSlice";
import { openPrompt } from "../store/slices/promptSlice";
import { newDay } from "../store/slices/historySlice";
import { addDaily, toggleDaily, delDaily, resetDaily } from "../store/slices/dailySlice";
import { addWeekly, completeWeekly, delWeekly } from "../store/slices/weeklySlice";
import { setScratch } from "../store/slices/scratchSlice";
import { addCompletedDaily } from "../store/slices/completedSlice";
import { toggleSidebar } from "../store/slices/sidebarSlice";


export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const daily = useSelector((state: RootState) => state.daily.daily);
  const weekly = useSelector((state: RootState) => state.weekly.weekly);
  const scratch = useSelector((state: RootState) => state.scratch.scratch);
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
    const doneDailyTasks = daily.filter((t) => t.done).map((t) => t.text);
    if (doneDailyTasks.length) {
      dispatch(newDay(doneDailyTasks));
      daily.filter((t) => t.done).forEach((t) => dispatch(addCompletedDaily(t)));
    }
    dispatch(resetDaily());
  };

  const handleDelDaily = (id: string) => {
    const taskToDelete = daily.find((t) => t.id === id);
    if (taskToDelete) {
      dispatch(delDaily(id));
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
        <div className="text-lg font-bold">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
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
            onClick={() => dispatch(openPrompt({ label: "Add daily task", onSubmit: (text) => dispatch(addDaily(text)) }))}
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
                onChange={() => dispatch(toggleDaily(t.id))}
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
          onChange={(e) => dispatch(setScratch(e.target.value))}
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
        </button>
      </div>
    </aside>
  );
}
