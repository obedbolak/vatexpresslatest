import { router } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect } from "react";
import useAuthStore, { RegisterData, User } from "../stores/authStore";
import { useOnboarding } from "./OnboardingContext";

interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: originalLogin,
    register: originalRegister,
    logout: originalLogout,
    getCurrentUser,
    updateProfile,
    clearError,
    setLoading,
  } = useAuthStore();

  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading } =
    useOnboarding();

  // Enhanced login with navigation
  const login = async (
    emailOrPhone: string,
    password: string
  ): Promise<boolean> => {
    try {
      const success = await originalLogin(emailOrPhone, password);
      if (success) {
        // Navigate to dashboard after successful login
        router.replace("./(dashboard)");
      }
      return success;
    } catch (error) {
      console.error("Login error in context:", error);
      return false;
    }
  };

  // Enhanced register with navigation
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const success = await originalRegister(userData);
      if (success) {
        // Navigate to dashboard after successful registration
        router.replace("./(dashboard)");
      }
      return success;
    } catch (error) {
      console.error("Register error in context:", error);
      return false;
    }
  };

  // Enhanced logout with navigation
  const logout = async (): Promise<void> => {
    try {
      await originalLogout();
      // Navigate based on onboarding status
      if (onboardingCompleted) {
        router.replace("/(auth)");
      } else {
        router.replace("/(onboarding)");
      }
    } catch (error) {
      console.error("Logout error in context:", error);
      // Even if logout fails on server, redirect appropriately
      if (onboardingCompleted) {
        router.replace("/(auth)");
      } else {
        router.replace("/(onboarding)");
      }
    }
  };

  // Handle authentication state changes and initial app load
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // Don't do anything if still loading auth or onboarding
      if (isLoading || onboardingLoading) return;

      // If we have a token but no user data, try to fetch user
      if (token && !user) {
        setLoading(true);
        try {
          await getCurrentUser();
        } catch (error) {
          console.error("Failed to get current user:", error);
          // If getting user fails, logout (which will redirect appropriately)
          await originalLogout();
          if (onboardingCompleted) {
            router.replace("/(auth)");
          } else {
            router.replace("/(onboarding)");
          }
        } finally {
          setLoading(false);
        }
        return;
      }

      // If authenticated, ensure we're on the dashboard
      if (isAuthenticated && user) {
        if (typeof window !== "undefined") {
          const currentPath = window.location?.pathname;
          if (!currentPath?.includes("/dashboard")) {
            router.replace("./(dashboard)");
          }
        } else {
          // For native, always redirect when authenticated
          router.replace("./(dashboard)");
        }
        return;
      }

      // If not authenticated and not loading, handle routing based on onboarding status
      if (!isAuthenticated && !isLoading) {
        if (typeof window !== "undefined") {
          const currentPath = window.location?.pathname;

          // If onboarding not completed, go to onboarding
          if (!onboardingCompleted) {
            if (!currentPath?.includes("/(onboarding)")) {
              router.replace("/(onboarding)");
            }
          } else {
            // If onboarding completed but not authenticated, go to auth
            if (!currentPath?.includes("/(auth)")) {
              router.replace("/(auth)");
            }
          }
        } else {
          // For native
          if (!onboardingCompleted) {
            router.replace("/(onboarding)");
          } else {
            router.replace("/(auth)");
          }
        }
      }
    };

    handleAuthStateChange();
  }, [
    isAuthenticated,
    user,
    token,
    isLoading,
    onboardingCompleted,
    onboardingLoading,
    getCurrentUser,
    originalLogout,
    setLoading,
  ]);

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
