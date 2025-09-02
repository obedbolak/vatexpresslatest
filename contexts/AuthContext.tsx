import { ImageStorageManager, UserDataStorage } from "@/utils/imagehelper";
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
  updateProfileImage: (imageUri: string) => Promise<boolean>;
  clearError: () => void;

  // Image utilities
  getLocalProfileImage: () => Promise<string | null>;
  refreshUserData: () => Promise<void>;
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
    getCurrentUser: originalGetCurrentUser,
    updateProfile: originalUpdateProfile,
    clearError,
    setLoading,
    setUser,
  } = useAuthStore();

  const { isCompleted: onboardingCompleted, isLoading: onboardingLoading } =
    useOnboarding();

  // Load stored user data on app start
  useEffect(() => {
    const loadStoredUserData = async () => {
      try {
        if (!user && !isLoading) {
          setLoading(true);
          const storedUser = await UserDataStorage.getUserData();

          if (storedUser && storedUser.id) {
            // Check if we have a valid token in Zustand store
            if (token) {
              setUser(storedUser);
            } else {
              // Clear stored data if no valid token
              await UserDataStorage.clearUserData();
            }
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load stored user data:", error);
        setLoading(false);
      }
    };

    loadStoredUserData();
  }, []);

  // Store user data whenever user changes
  useEffect(() => {
    const storeUserData = async () => {
      try {
        if (user && user.id) {
          await UserDataStorage.storeUserData(user);
        }
      } catch (error) {
        console.error("Failed to store user data:", error);
      }
    };

    storeUserData();
  }, [user]);

  // Enhanced login with storage
  const login = async (
    emailOrPhone: string,
    password: string
  ): Promise<boolean> => {
    try {
      const success = await originalLogin(emailOrPhone, password);
      if (success) {
        // Get the updated user from store
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          // Store complete user data including images
          await UserDataStorage.storeUserData(currentUser);
        }
        router.replace("/(dashboard)");
      }
      return success;
    } catch (error) {
      console.error("Login error in context:", error);
      return false;
    }
  };

  // Enhanced register with storage
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const success = await originalRegister(userData);
      if (success) {
        // Get the updated user from store
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          // Store complete user data
          await UserDataStorage.storeUserData(currentUser);
        }
        router.replace("/(dashboard)");
      }
      return success;
    } catch (error) {
      console.error("Register error in context:", error);
      return false;
    }
  };

  // Enhanced logout with cleanup
  const logout = async (): Promise<void> => {
    try {
      // Clear stored user data and images
      if (user?.id) {
        await ImageStorageManager.removeProfileImage(user.id);
      }
      await UserDataStorage.clearUserData();

      // Call original logout
      await originalLogout();

      // Navigate based on onboarding status
      if (onboardingCompleted) {
        router.replace("/(auth)");
      } else {
        router.replace("/(onboarding)");
      }
    } catch (error) {
      console.error("Logout error in context:", error);
      // Even if cleanup fails, continue with logout
      await originalLogout();
      if (onboardingCompleted) {
        router.replace("/(auth)");
      } else {
        router.replace("/(onboarding)");
      }
    }
  };

  // Enhanced getCurrentUser with storage
  const getCurrentUser = async (): Promise<void> => {
    try {
      await originalGetCurrentUser();
      // After getting user from API, store locally
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        await UserDataStorage.storeUserData(currentUser);
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  };

  // Enhanced updateProfile with storage
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const success = await originalUpdateProfile(userData);
      if (success) {
        // Update stored data
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          await UserDataStorage.storeUserData(currentUser);
        }
      }
      return success;
    } catch (error) {
      console.error("Profile update error in context:", error);
      return false;
    }
  };

  // New method for updating profile image
  const updateProfileImage = async (imageUri: string): Promise<boolean> => {
    try {
      if (!user?.id || !token) {
        throw new Error("User not authenticated");
      }

      setLoading(true);

      // First, compress and store image locally
      const compressedImageUri = await ImageStorageManager.compressImage(
        imageUri
      );
      const localImagePath = await ImageStorageManager.storeProfileImage(
        user.id,
        compressedImageUri
      );

      // Upload to server
      const formData = new FormData();
      formData.append("profileImage", {
        uri: compressedImageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000/api/v1"
        }/users/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image update failed");
      }

      if (data.success) {
        // Update user with new profile image data
        const updatedUser = {
          ...user,
          profilePic: {
            ...data.data.profilePic,
            localPath: localImagePath, // Add local path reference
          },
          updatedAt: new Date().toISOString(),
        };

        setUser(updatedUser);
        await UserDataStorage.storeUserData(updatedUser);

        setLoading(false);
        return true;
      } else {
        throw new Error(data.message || "Image update failed");
      }
    } catch (error) {
      console.error("Image update error:", error);
      setLoading(false);
      return false;
    }
  };

  // Get local profile image path
  const getLocalProfileImage = async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      return await ImageStorageManager.getProfileImage(user.id);
    } catch (error) {
      console.error("Failed to get local profile image:", error);
      return null;
    }
  };

  // Refresh user data from storage
  const refreshUserData = async (): Promise<void> => {
    try {
      const storedUser = await UserDataStorage.getUserData();
      if (storedUser && storedUser.id === user?.id) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
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
          await logout();
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
            router.replace("/(dashboard)");
          }
        } else {
          // For native, always redirect when authenticated
          router.replace("/(dashboard)");
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
    updateProfileImage,
    clearError,
    getLocalProfileImage,
    refreshUserData,
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
