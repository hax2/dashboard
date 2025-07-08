import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { openPrompt as openPromptAction, closePrompt as closePromptAction } from "./store/slices/promptSlice";
import { setView as setViewAction } from "./store/slices/viewSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "./hooks/useDarkMode";
import { Sidebar } from "./components/Sidebar";
import { ProjectsView } from "./components/ProjectsView";
import { ProjectDetailView } from "./components/ProjectDetailView";
import { CompletedView } from "./components/CompletedView";
import { DeletedView } from "./components/DeletedView";
import { ReviewView } from "./components/ReviewView";
import { Prompt } from "./components/Prompt";

const SamerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const isPromptOpen = useSelector((state: RootState) => state.prompt.open);
  const promptLabel = useSelector((state: RootState) => state.prompt.label);
  const promptOnSubmit = useSelector((state: RootState) => state.prompt.onSubmit);
  const view = useSelector((state: RootState) => state.view.currentView);
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  let Main: React.ReactNode;
  if (view === "projects") Main = <ProjectsView />;
  else if (view === "completed") Main = <CompletedView />;
  else if (view === "deleted") Main = <DeletedView />;
  else if (view === "review") Main = <ReviewView />;
  else Main = <ProjectDetailView projectId={view.projectId} />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={JSON.stringify(view)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {Main}
          </motion.div>
        </AnimatePresence>
      </main>
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <Prompt
        key={isPromptOpen ? "open-prompt" : "closed-prompt"}
        open={isPromptOpen}
        label={promptLabel}
        onSubmit={promptOnSubmit || (() => {})}
        onClose={() => dispatch(closePromptAction())}
        className={isPromptOpen ? "" : "hidden"}
      />
    </div>
  );
};

export default SamerDashboard;