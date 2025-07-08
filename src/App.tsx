
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SubcategoryPage from "./pages/SubcategoryPage";
import SnowfallPage from "./pages/SnowfallPage";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { PopupProvider } from "./contexts/PopupContext";
import { SnowfallPopupProvider } from "./contexts/SnowfallPopupContext";
import { ModernResultPopup } from "./components/ModernResultPopup";
import { SnowfallResultPopup } from "./components/SnowfallResultPopup";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { useErrorHandler } from "./hooks/useErrorHandler";
import { useAnalytics } from "./hooks/useAnalytics";

// Optimized QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased
      gcTime: 15 * 60 * 1000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

function RouterContent() {
  useAnalytics();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/snowfall" element={<SnowfallPage />} />
      <Route 
        path="/admin" 
        element={
          <AdminProtectedRoute>
            {(userRole: string) => <AdminPanel userRole={userRole} />}
          </AdminProtectedRoute>
        } 
      />
      <Route path="/:category" element={<SubcategoryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppContent() {
  useErrorHandler();

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <RouterContent />
      </BrowserRouter>
      <ModernResultPopup />
      <SnowfallResultPopup />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PopupProvider>
          <SnowfallPopupProvider>
            <AppContent />
          </SnowfallPopupProvider>
        </PopupProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
