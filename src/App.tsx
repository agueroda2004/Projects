import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/shared/components/Layout";
import { StoreProvider } from "@/shared/context/StoreContext";
import ToasterContainer from "@/shared/ui/Toaster";
import AuthGuard from "@/features/auth/components/AuthGuard";
import LoginPage from "@/features/auth/page/LoginPage";
import ProjectsPage from "@/features/projects/page/ProjectsPage";
import ProjectDetailPage from "@/features/modules/page/ProjectDetailPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <StoreProvider>
                <Layout />
              </StoreProvider>
            </AuthGuard>
          }
        >
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Route>
      </Routes>
      <ToasterContainer />
    </HashRouter>
  );
}