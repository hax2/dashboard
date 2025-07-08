import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { openPrompt } from "../store/slices/promptSlice";
import { addProject, delProject, completeProject } from "../store/slices/projectsSlice";
import { setView } from "../store/slices/viewSlice";
import { Project } from "../types";

export const ProjectsView: React.FC = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={() => dispatch(openPrompt({ label: "Add project", onSubmit: (title) => dispatch(addProject(title)) }))}
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
            <motion.div layoutId={`project-${p.id}`} key={p.id}>
              <ProjectCard project={p} />
            </motion.div>
          ))}
      </div>
    </div>
  );
};

interface ProjectCardProps {
    project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
    const dispatch = useDispatch();
    const open = project.subtasks.filter((s) => !s.done);
    return (
        <div
            className="bg-white dark:bg-dark-surface border dark:border-gray-700 rounded-xl p-4 flex flex-col gap-2 shadow-sm group"
        >
            <div className="flex items-center justify-between">
                <button
                    onClick={() => dispatch(setView({ projectId: project.id }))}
                    className="text-lg font-semibold text-blue-700 hover:underline text-left"
                >
                    {project.title}
                </button>
                <button
                    onClick={() => {
                        dispatch(delProject(project.id));
                    }}
                    className="opacity-0 group-hover:opacity-60 text-gray-400 hover:text-red-500"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            <div className="text-sm">{open.length} open subtasks</div>
            <ul className="flex flex-col gap-1">
                {open.slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center text-sm truncate">
                        <input type="checkbox" disabled className="mr-2" />
                        {s.text}
                    </li>
                ))}
                {open.length > 3 && (
                    <li className="text-xs text-gray-400">
                        +{open.length - 3} more
                    </li>
                )}
            </ul>
            <button
                onClick={() => {
                    dispatch(completeProject(project.id));
                }}
                className="self-start px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
            >
                Done
            </button>
        </div>
    );
};
