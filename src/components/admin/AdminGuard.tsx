import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useAdmin";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: isAdmin, isLoading, error } = useIsAdmin();

  useEffect(() => {
    if (error || (isAdmin === false && !isLoading)) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this area.",
        variant: "destructive"
      });
    }
  }, [error, isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}