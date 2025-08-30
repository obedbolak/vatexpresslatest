import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingState {
  isCompleted: boolean;
  isLoading: boolean;
  setCompleted: (completed: boolean) => void;
  setLoading: (loading: boolean) => void;
  checkOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isCompleted: false,
      isLoading: true,

      setCompleted: (isCompleted) => set({ isCompleted }),
      setLoading: (isLoading) => set({ isLoading }),

      checkOnboardingStatus: async () => {
        try {
          set({ isLoading: true });
          const onboardingStatus = await AsyncStorage.getItem(
            "onboardingState"
          );
          const isCompleted = onboardingStatus === "completed";
          set({ isCompleted, isLoading: false });
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          set({ isCompleted: false, isLoading: false });
        }
      },

      completeOnboarding: async () => {
        try {
          await AsyncStorage.setItem("onboardingState", "completed");
          set({ isCompleted: true });
        } catch (error) {
          console.error("Error completing onboarding:", error);
        }
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isCompleted: state.isCompleted,
      }),
    }
  )
);

export default useOnboardingStore;
