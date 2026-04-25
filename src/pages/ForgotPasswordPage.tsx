import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset, updatePassword } from "@/services/passwordResetService";

type Step = "email" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res.status === "success") {
        setPhone(res.data?.phone || "");
        toast({
          title: "Email verified",
          description: res.data?.phone
            ? `A reset code was generated for the phone associated with this email (${res.data.phone}).`
            : "A reset code was generated.",
        });
        setStep("newPassword");
      } else {
        setApiError(res.message || "Email not found");
      }
    } catch (err: any) {
      setApiError(err?.message || "Failed to request reset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (newPassword.length < 4) {
      setApiError("Password must be at least 4 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setApiError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(email.trim(), newPassword);
      if (res.status === "success") {
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        setStep("done");
      } else {
        setApiError(res.message || "Failed to update password");
      }
    } catch (err: any) {
      setApiError(err?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 glass-effect">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Tractor className="w-9 h-9 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {step === "email" && "Forgot Password"}
            {step === "newPassword" && "Set New Password"}
            {step === "done" && "Password Updated"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === "email" && "Enter your email to start the reset process"}
            {step === "newPassword" && "Choose a new password for your account"}
            {step === "done" && "Your password has been changed successfully"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {apiError && (
            <div className="p-3 mb-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleRequest} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email (Username)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your account email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Checking...</>) : "Continue"}
              </Button>
            </form>
          )}

          {step === "newPassword" && (
            <form onSubmit={handleReset} className="space-y-5">
              {phone && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  Reset code generated for phone: <span className="font-semibold">{phone}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>) : "Save New Password"}
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your password has been updated. Use your new password to sign in.
              </p>
              <Button
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 shadow-lg"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </div>
          )}

          {step !== "done" && (
            <div className="mt-6 text-center">
              <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="absolute bottom-4 text-center w-full text-sm text-muted-foreground">
        &copy; Hortense Bana 2026
      </footer>
    </div>
  );
}
