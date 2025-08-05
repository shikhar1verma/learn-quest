import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Quests from "./pages/Quests";
import Skills from "./pages/Skills";
import Events from "./pages/Events";
import Store from "./pages/Store";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminRules from "./pages/admin/AdminRules";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminQuests from "./pages/admin/AdminQuests";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminStore from "./pages/admin/AdminStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/quests" element={
              <ProtectedRoute>
                <AppLayout>
                  <Quests />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/skills" element={
              <ProtectedRoute>
                <AppLayout>
                  <Skills />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <AppLayout>
                  <Events />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/store" element={
              <ProtectedRoute>
                <AppLayout>
                  <Store />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminOverview />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/rules" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminRules />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminAudit />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/quests" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminQuests />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/skills" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminSkills />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="/admin/store" element={
              <ProtectedRoute>
                <AdminGuard>
                  <AdminLayout>
                    <AdminStore />
                  </AdminLayout>
                </AdminGuard>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;