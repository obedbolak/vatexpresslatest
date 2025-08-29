import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  isVerified: boolean;
  role: "passenger" | "admin";
  preferences?: {
    seatPreference: "window" | "aisle" | "any";
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  profilePic?: {
    public_id: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  resetAuth: () => void;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
}

// API Base URL - Update this to match your backend
const API_BASE_URL = "http://10.0.2.2:3000/api/v1"; // Update this!

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Setters
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token && !!get().user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      resetAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      // API Actions
      login: async (emailOrPhone: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              emailOrPhone,
              password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Login failed");
          }

          if (data.success) {
            const { user, token } = data.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            throw new Error(data.message || "Login failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Registration failed");
          }

          if (data.success) {
            const { user, token } = data.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            throw new Error(data.message || "Registration failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: async () => {
        try {
          const { token } = get();

          if (token) {
            // Call logout API
            await fetch(`${API_BASE_URL}/users/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
          }
        } catch (error) {
          console.log("Logout API call failed:", error);
          // Continue with local logout even if API call fails
        } finally {
          // Clear local state regardless of API call result
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      getCurrentUser: async () => {
        try {
          const { token } = get();

          if (!token) {
            throw new Error("No token available");
          }

          set({ isLoading: true });

          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (!response.ok) {
            if (response.status === 401) {
              // Token is invalid, logout user
              get().resetAuth();
              throw new Error("Session expired");
            }
            throw new Error(data.message || "Failed to get user data");
          }

          if (data.success) {
            set({
              user: data.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to get user data";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const { token } = get();

          if (!token) {
            throw new Error("No token available");
          }

          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Profile update failed");
          }

          if (data.success) {
            set({
              user: data.data.user,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            throw new Error(data.message || "Profile update failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Profile update failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
