import React from "react";
import { ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react";
import { useStore } from "../hooks/useStore";

export const ProjectDetailView = ({ projectId }: { projectId: string }) => {
  const {
    projects,
    setView,
    openPrompt,
    addSubtask,
    toggleSubtask,
    delSubtask,
    addAISubtasks,
    setNotes,
  } = useStore();
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
