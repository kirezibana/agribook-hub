import { createContext, useContext, useState, ReactNode } from "react";
import { loginUser } from "@/services/usersService";

export interface User {
  id?: string;
  username?: string;
  email?: string;
  name: string;
  role?: string;
  status?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await loginUser({ email, password });

      if (response.status === "success") {
        // Handle the response from the backend API
        // The backend returns the user data in response.data directly
        // According to the API response format: {status: "success", message: "Login successful", data: {...}}
        
        // Extract user data from response
        let userData: User;
        
        if (response.data) {
          // Standard format: {status: "success", message: "...", data: {id, name, email, role, ...}}
          userData = {
            id: response.data.id?.toString() || "",
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
            status: response.data.status,
          };
        } else {
          // Fallback: if response.data is not present but status is success, 
          // we might need to handle differently based on actual API response
          console.warn("Response has success status but no data property", response);
          return false; // Indicate login failure
        }
        
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, ...userData };
        localStorage.setItem("auth_user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
