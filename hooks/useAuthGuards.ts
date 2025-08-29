import { router, usePathname } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    const isAuthRoute =
      pathname?.includes("/(auth)") || pathname?.includes("/auth");
    const isOnboardingRoute =
      pathname?.includes("/(onboarding)") || pathname?.includes("/onboarding");
    const isDashboardRoute = pathname?.includes("/dashboard");

    // If user is authenticated but not on dashboard, redirect to dashboard
    if (isAuthenticated && user && !isDashboardRoute) {
      console.log("Redirecting authenticated user to dashboard");
      router.replace("/dashboard");
      return;
    }

    // If user is not authenticated and not on auth/onboarding routes, redirect to auth
    if (!isAuthenticated && !isAuthRoute && !isOnboardingRoute) {
      console.log("Redirecting unauthenticated user to auth");
      router.replace("/(auth)");
      return;
    }
  }, [isAuthenticated, isLoading, user, pathname]);

  return { isAuthenticated, isLoading, user };
};
