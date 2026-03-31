import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ManagerSidebar } from "./ManagerSidebar";
import { AdminHeader } from "./AdminHeader";

interface ManagerLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function ManagerLayout({ children, title, subtitle }: ManagerLayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          &copy; Hortense Bana 2026
        </footer>
      </div>
    </div>
  );
}
