import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { openPrompt as openPromptAction, closePrompt as closePromptAction } from "./store/slices/promptSlice";
import { setView as setViewAction } from "./store/slices/viewSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { ProjectsView } from "./components/ProjectsView";
import { ProjectDetailView } from "./components/ProjectDetailView";
import { CompletedView } from "./components/CompletedView";
import { DeletedView } from "./components/DeletedView";
import { ReviewView } from "./components/ReviewView";
import { Prompt } from "./components/Prompt";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { toggleSidebar } from "./store/slices/sidebarSlice";

const SamerDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const isPromptOpen = useSelector((state: RootState) => state.prompt.open);
  const promptLabel = useSelector((state: RootState) => state.prompt.label);
  const promptOnSubmit = useSelector((state: RootState) => state.prompt.onSubmit);
  const view = useSelector((state: RootState) => state.view.currentView);
  const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);

  let Main: React.ReactNode;
  if (view === "projects") Main = <ProjectsView />;
  else if (view === "completed") Main = <CompletedView />;
  else if (view === "deleted") Main = <DeletedView />;
  else if (view === "review") Main = <ReviewView />;
  else Main = <ProjectDetailView projectId={view.projectId} />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-background text-gray-800 dark:text-dark-onBackground">
      {isSidebarOpen && <Sidebar />}
      <main className={`flex-1 overflow-y-auto ${isSidebarOpen ? '' : 'w-full'}`}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`absolute top-4 ${isSidebarOpen ? 'left-80' : 'left-4'} p-2 rounded-full bg-gray-200 dark:bg-dark-background z-10 transition-all duration-300`}
        >
          {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
        <AnimatePresence>
          {Main}
        </AnimatePresence>
      </main>
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