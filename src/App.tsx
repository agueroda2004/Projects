import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/shared/components/Layout";
import { StoreProvider } from "@/shared/context/StoreContext";
import ToasterContainer from "@/shared/ui/Toaster";
import ProjectsPage from "@/features/projects/page/ProjectsPage";
import ProjectDetailPage from "@/features/modules/page/ProjectDetailPage";

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Route>
        </Routes>
      </HashRouter>
      <ToasterContainer />
    </StoreProvider>
  );
}