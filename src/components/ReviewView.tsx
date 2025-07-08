import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setView } from "../store/slices/viewSlice";

export const ReviewView: React.FC = () => {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history.history);

  const maxTasks = history.reduce((max, entry) => Math.max(max, entry.tasks.length), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => dispatch(setView("projects"))}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Daily Review</h2>
      <div className="flex flex-col gap-4">
        {history.length === 0 && (
          <div className="text-gray-400 text-sm">No entries</div>
        )}
        {history.map((h) => (
          <div key={h.date} className="bg-white dark:bg-dark-surface border dark:border-gray-700 rounded-xl p-4">
            <div className="font-semibold mb-2">
              {new Date(h.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">{h.tasks.length} tasks completed</div>
              <div className="flex-1 h-4 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400"
                  style={{ width: `${(h.tasks.length / (maxTasks || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <ul className="flex flex-col gap-1 mt-2">
              {h.tasks.map((t, i) => (
                <li key={i} className="text-sm line-through text-gray-400">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
