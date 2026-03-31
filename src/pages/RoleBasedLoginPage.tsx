import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoleBasedLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already authenticated, redirect based on role
  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.role === "manager") {
      return <Navigate to="/manager-dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Role is now set in AuthContext after login, re-read from localStorage
        const storedUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
        if (storedUser?.role === "admin") {
          toast({
            title: "Welcome Admin!",
            description: "You have successfully logged in to the admin panel.",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Welcome!",
            description: "You have successfully logged in.",
          });
          navigate("/home");
        }
      } else {
        setApiError("Invalid email or password");
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const message = error?.message || "Failed to login. Please try again.";
      setApiError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 glass-effect">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Tractor className="w-9 h-9 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            EARMS Login
          </CardTitle>
          <CardDescription className="text-base">
            Agriculture Equipment Booking System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => navigate("/register")}>
                Create Account
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>

      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        &copy; Hortense Bana 2026
      </footer>
    </div>
  );
}