import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Quests from "./pages/Quests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          <Route path="/quests" element={
            <AppLayout>
              <Quests />
            </AppLayout>
          } />
          <Route path="/skills" element={
            <AppLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Skills Coming Soon</h1>
                <p className="text-muted-foreground">Track your skill progression and milestones</p>
              </div>
            </AppLayout>
          } />
          <Route path="/events" element={
            <AppLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Events Coming Soon</h1>
                <p className="text-muted-foreground">Log custom activities and achievements</p>
              </div>
            </AppLayout>
          } />
          <Route path="/store" element={
            <AppLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Store Coming Soon</h1>
                <p className="text-muted-foreground">Spend your XP on rewards and treats</p>
              </div>
            </AppLayout>
          } />
          <Route path="/analytics" element={
            <AppLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Analytics Coming Soon</h1>
                <p className="text-muted-foreground">Visualize your progress and trends</p>
              </div>
            </AppLayout>
          } />
          <Route path="/admin" element={
            <AppLayout>
              <div className="text-center py-20">
                <h1 className="text-2xl font-bold mb-4">Admin Panel Coming Soon</h1>
                <p className="text-muted-foreground">Configure rules and manage the economy</p>
              </div>
            </AppLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;