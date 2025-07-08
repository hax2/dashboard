import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setView } from "../store/slices/viewSlice";

export const ReviewView: React.FC = () => {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.history.history);

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => dispatch(setView("projects"))}
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
};
