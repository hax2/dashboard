import React from "react";
import { ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setView } from "../store/slices/viewSlice";
import { restoreDeletedProject } from "../store/slices/projectsSlice";
import { restoreDaily } from "../store/slices/dailySlice";
import { restoreWeekly } from "../store/slices/weeklySlice";
import { Project, Task, WeeklyTask } from "../types";

export const DeletedView: React.FC = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const dailyTasks = useSelector((state: RootState) => state.daily.daily);
  const weeklyTasks = useSelector((state: RootState) => state.weekly.weekly);

  const deletedProjects = projects.filter((p: Project) => p.deleted);
  const deletedDailyTasks = dailyTasks.filter((t: Task) => t.deleted);
  const deletedWeeklyTasks = weeklyTasks.filter((t: WeeklyTask) => t.deleted);

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        onClick={() => dispatch(setView("projects"))}
        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-background w-fit"
      >
        <ArrowLeft size={18} /> Back
      </button>
      <h2 className="text-2xl font-bold">Deleted Items</h2>

      <section>
        <h3 className="text-xl font-semibold mb-2">Projects</h3>
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
              <button
                onClick={() => dispatch(restoreDeletedProject(project.id))}
                className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Daily Tasks</h3>
        <ul className="flex flex-col gap-1">
          {deletedDailyTasks.length === 0 && (
            <li className="text-gray-400 text-sm">No deleted daily tasks</li>
          )}
          {deletedDailyTasks.map((task: Task) => (
            <li
              key={task.id}
              className="flex items-center group hover:bg-gray-50 rounded px-1"
            >
              <span className="flex-1 text-sm line-through text-gray-400">
                {task.text}
              </span>
              <button
                onClick={() => dispatch(restoreDaily(task.id))}
                className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Weekly Tasks</h3>
        <ul className="flex flex-col gap-1">
          {deletedWeeklyTasks.length === 0 && (
            <li className="text-gray-400 text-sm">No deleted weekly tasks</li>
          )}
          {deletedWeeklyTasks.map((task: WeeklyTask) => (
            <li
              key={task.id}
              className="flex items-center group hover:bg-gray-50 rounded px-1"
            >
              <span className="flex-1 text-sm line-through text-gray-400">
                {task.text}
              </span>
              <button
                onClick={() => dispatch(restoreWeekly(task.id))}
                className="ml-2 px-2 py-0.5 rounded bg-green-100 hover:bg-green-200 text-green-700 text-xs"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
