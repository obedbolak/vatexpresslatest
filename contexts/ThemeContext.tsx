// contexts/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { Colors, ColorScheme, ColorTheme } from "../constants/Colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  // Current theme data
  theme: ColorTheme;
  colorScheme: ColorScheme;

  // Theme mode ('light', 'dark', or 'system')
  themeMode: ThemeMode;

  // Theme switching functions
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Convenience booleans
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@app_theme_preference";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine actual color scheme based on theme mode
  const getColorScheme = (): ColorScheme => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  };

  const colorScheme = getColorScheme();
  const theme = Colors[colorScheme];

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme &&
          (savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system")
        ) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  };

  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const newMode = colorScheme === "light" ? "dark" : "light";
    setTheme(newMode);
  };

  const contextValue: ThemeContextType = {
    theme,
    colorScheme,
    themeMode,
    setTheme,
    toggleTheme,
    isDark: colorScheme === "dark",
    isLight: colorScheme === "light",
  };

  // Don't render children until theme is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Convenience hooks for specific parts of the theme
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme;
};

export const useThemeGradients = () => {
  const { theme } = useTheme();
  return theme.gradients;
};

export const useThemeStatus = () => {
  const { theme } = useTheme();
  return theme.status;
};
