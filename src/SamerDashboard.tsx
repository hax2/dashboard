import React from "react";
import { useStore } from "./hooks/useStore";
import { Sidebar } from "./components/Sidebar";
import { ProjectsView } from "./components/ProjectsView";
import { ProjectDetailView } from "./components/ProjectDetailView";
import { CompletedView } from "./components/CompletedView";
import { DeletedView } from "./components/DeletedView";
import { ReviewView } from "./components/ReviewView";
import { Prompt } from "./components/Prompt";

const SamerDashboard: React.FC = () => {
  console.log("SamerDashboard rendered");
  const { view, isPromptOpen, promptLabel, promptOnSubmit, openPrompt, closePrompt } = useStore();

  let Main: React.ReactNode;
  if (view === "projects") Main = <ProjectsView />;
  else if (view === "completed") Main = <CompletedView />;
  else if (view === "deleted") Main = <DeletedView />;
  else if (view === "review") Main = <ReviewView />;
  else Main = <ProjectDetailView projectId={view.projectId} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{Main}</main>
      <Prompt
        open={isPromptOpen}
        label={promptLabel}
        onSubmit={promptOnSubmit}
        onClose={closePrompt}
        className={isPromptOpen ? "" : "hidden"}
      />
    </div>
  );
};

export default SamerDashboard;