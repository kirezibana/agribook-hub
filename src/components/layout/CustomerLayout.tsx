import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Leaf, Calendar } from "lucide-react";

interface CustomerLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function CustomerLayout({ children, title, subtitle }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  AgriRent
                </span>
                <span className="text-xs text-muted-foreground">Customer Portal</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => navigate("/home")}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Browse Equipment
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/my-bookings")}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Button>
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">AgriRent</h3>
              <p className="text-sm text-muted-foreground">
                Professional agricultural equipment rental platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: support@agrirent.com</li>
                <li>Phone: +255 700 000 000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AgriRent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
