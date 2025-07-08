import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setView } from "../store/slices/viewSlice";
import { Project } from "../types";

export const DeletedView: React.FC = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const deletedProjects = projects.filter((p: Project) => p.deleted);

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => dispatch(setView("projects"))}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Deleted Projects</h2>

      <section>
        <ul className="flex flex-col gap-1">
          {deletedProjects.length === 0 && (
            <li className="text-gray-400 text-sm">No deleted projects</li>
          )}
          {deletedProjects.map((project: Project) => (
            <li
              key={project.id}
              className="flex items-center group hover:bg-gray-50 rounded px-1"
            >
              <span className="flex-1 text-sm line-through text-gray-400">
                {project.title}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
