import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { daysAgo } from "../lib/utils";
import { exportAllData, importAllData } from "../lib/storage";

export const Sidebar: React.FC = () => {
  const {
    daily,
    weekly,
    scratch,
    setScratch,
    setView,
    openPrompt,
    newDay,
    addDaily,
    toggleDaily,
    delDaily,
    addWeekly,
    completeWeekly,
    delWeekly,
  } = useStore();

  const fileRef = React.useRef<HTMLInputElement>(null);
  const triggerImport = () => fileRef.current?.click();
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) importAllData(f);
  };

  return (
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
};
