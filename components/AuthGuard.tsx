import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuthGuard } from "../hooks/useAuthGuards";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { theme } = useTheme();
  const { isLoading } = useAuthGuard();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.gradients.background.colors}
        start={theme.gradients.background.start}
        end={theme.gradients.background.end}
        locations={theme.gradients.background.locations}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </LinearGradient>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
