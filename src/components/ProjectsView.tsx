import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { Project } from "../types";

export const ProjectsView: React.FC = () => {
  const { projects, setView, openPrompt, addProject, delProject, completeProject } = useStore();

  return (
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
          .map((p) => (
            <ProjectCard key={p.id} project={p} setView={setView} delProject={delProject} completeProject={completeProject} />
          ))}
      </div>
    </div>
  );
};

interface ProjectCardProps {
    project: Project;
    setView: (view: { projectId: string }) => void;
    delProject: (id: string) => void;
    completeProject: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, setView, delProject, completeProject }) => {
    const open = project.subtasks.filter((s) => !s.done);
    return (
        <div
            className="bg-white border rounded-xl p-4 flex flex-col gap-2 shadow-sm group"
        >
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setView({ projectId: project.id })}
                    className="text-lg font-semibold text-blue-700 hover:underline text-left"
                >
                    {project.title}
                </button>
                <button
                    onClick={() => delProject(project.id)}
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
                onClick={() => completeProject(project.id)}
                className="self-start px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
            >
                Done
            </button>
        </div>
    );
};
