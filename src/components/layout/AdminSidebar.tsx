import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Wrench, 
  CalendarCheck, 
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tractor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Equipment", href: "/equipment", icon: Wrench },
  { name: "Bookings", href: "/bookings", icon: CalendarCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "gradient-sidebar min-h-screen flex flex-col transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg">
            <Tractor className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg text-sidebar-foreground">AgriRent</h1>
              <p className="text-xs text-sidebar-foreground/70">Equipment Booking</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const linkContent = (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-pulse")} />
              {!collapsed && (
                <span className="font-medium animate-fade-in">{item.name}</span>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 animate-fade-in">
            <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70">@{user.username}</p>
          </div>
        )}
        
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Logout</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
