import React, { createContext, ReactNode, useContext, useEffect } from "react";
import useOnboardingStore from "../stores/onboardingStore";

interface OnboardingContextType {
  isCompleted: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const {
    isCompleted,
    isLoading,
    checkOnboardingStatus,
    completeOnboarding: originalCompleteOnboarding,
  } = useOnboardingStore();

  // Check onboarding status on app start
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    await originalCompleteOnboarding();
  };

  const contextValue: OnboardingContextType = {
    isCompleted,
    isLoading,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
