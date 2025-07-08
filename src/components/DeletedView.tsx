import React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";

export const DeletedView: React.FC = () => {
  const { deleted, setView, restore, purge } = useStore();

  return (
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
};
