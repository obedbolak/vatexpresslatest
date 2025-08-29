// constants/Colors.ts
/**
 * Gradient color system for the app with light and dark mode support.
 * Uses expo-linear-gradient compatible format with consistent directions and stops.
 */

const primaryLight = "#3B82F6";
const primaryDark = "#60A5FA";
const backgroundTextLight = "#0F172A";
const backgroundTextDark = "#F8FAFC";

// Define types that match expo-linear-gradient requirements
export type ColorScheme = "light" | "dark";

// Fixed types to match expo-linear-gradient expectations
export interface GradientStyle {
  colors: readonly [string, string, ...string[]]; // At least 2 colors
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: readonly [number, number, ...number[]]; // At least 2 locations
  text: string;
  border?: string;
  pressed?: Omit<GradientStyle, "text" | "border">;
  hover?: Omit<GradientStyle, "text" | "border">;
}

export interface StatusGradient {
  colors: readonly [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations: readonly [number, number, ...number[]];
  text: string;
  pressed: {
    colors: readonly [string, string, ...string[]];
    start: { x: number; y: number };
    end: { x: number; y: number };
    locations: readonly [number, number, ...number[]];
  };
}

export interface ColorTheme {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  gradients: {
    background: GradientStyle;
    card: GradientStyle;
    buttonPrimary: GradientStyle;
    buttonSecondary: GradientStyle;
    dropdown: GradientStyle;
    disabled: GradientStyle;
  };
  status: {
    success: StatusGradient;
    warning: StatusGradient;
    error: StatusGradient;
    info: StatusGradient;
  };
  focus: {
    borderColor: string;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
  };
}

export const Colors: Record<ColorScheme, ColorTheme> = {
  light: {
    // Basic colors
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",

    // Gradient definitions
    gradients: {
      background: {
        colors: ["#F8FAFC", "#F1F4F8", "#EEF2FF"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        locations: [0, 0.6, 1] as const,
        text: backgroundTextLight,
      },
      card: {
        colors: ["#FFFFFF", "#F9FAFB", "#F3F4F6"] as const,
        start: { x: 0.5, y: 0 },
        end: { x: 0.5, y: 1 },
        locations: [0, 0.8, 1] as const,
        text: backgroundTextLight,
        border: "#E2E8F0",
      },
      buttonPrimary: {
        colors: ["#60A5FA", primaryLight, "#2563EB"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#2563EB", "#1D4ED8", "#1E40AF"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
        hover: {
          colors: [primaryLight, "#2563EB", "#1D4ED8"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      buttonSecondary: {
        colors: ["#F1F5F9", "#E2E8F0", "#CBD5E1"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: backgroundTextLight,
        pressed: {
          colors: ["#CBD5E1", "#94A3B8", "#64748B"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      dropdown: {
        colors: ["#FFFFFF", "#F8FAFC"] as const,
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        text: backgroundTextLight,
        border: "#E2E8F0",
      },
      disabled: {
        colors: ["#F3F4F6", "#E5E7EB", "#D1D5DB"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#9CA3AF",
      },
    },

    // Status colors
    status: {
      success: {
        colors: ["#34D399", "#10B981", "#059669"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#059669", "#047857", "#065F46"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      warning: {
        colors: ["#FBBF24", "#F59E0B", "#D97706"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#0F172A",
        pressed: {
          colors: ["#D97706", "#B45309", "#92400E"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      error: {
        colors: ["#F43F5E", "#E11D48", "#BE123C"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#BE123C", "#9F1239", "#881337"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      info: {
        colors: ["#38BDF8", "#0EA5E9", "#0369A1"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#0369A1", "#0C4A6E", "#082F49"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
    },

    // Focus states
    focus: {
      borderColor: primaryLight,
      shadowColor: primaryLight,
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  },

  dark: {
    // Basic colors
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",

    // Gradient definitions
    gradients: {
      background: {
        colors: ["#0B1220", "#0F172A", "#111827"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        locations: [0, 0.6, 1] as const,
        text: backgroundTextDark,
      },
      card: {
        colors: ["#0F172A", "#111827", "#1F2937"] as const,
        start: { x: 0.5, y: 0 },
        end: { x: 0.5, y: 1 },
        locations: [0, 0.8, 1] as const,
        text: backgroundTextDark,
        border: "#1F2937",
      },
      buttonPrimary: {
        colors: ["#1E3A8A", "#1D4ED8", primaryDark] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#172554", "#1E3A8A", "#1D4ED8"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
        hover: {
          colors: ["#1D4ED8", "#2563EB", primaryDark] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      buttonSecondary: {
        colors: ["#1F2937", "#111827", "#0F172A"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#E5E7EB",
        pressed: {
          colors: ["#0F172A", "#0B1220", "#030712"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      dropdown: {
        colors: ["#0F172A", "#111827"] as const,
        start: { x: 0, y: 0 },
        end: { x: 0, y: 1 },
        text: backgroundTextDark,
        border: "#1F2937",
      },
      disabled: {
        colors: ["#374151", "#1F2937", "#111827"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#6B7280",
      },
    },

    // Status colors (same as light mode)
    status: {
      success: {
        colors: ["#34D399", "#10B981", "#059669"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#059669", "#047857", "#065F46"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      warning: {
        colors: ["#FBBF24", "#F59E0B", "#D97706"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#0F172A",
        pressed: {
          colors: ["#D97706", "#B45309", "#92400E"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      error: {
        colors: ["#F43F5E", "#E11D48", "#BE123C"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#BE123C", "#9F1239", "#881337"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
      info: {
        colors: ["#38BDF8", "#0EA5E9", "#0369A1"] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        locations: [0, 0.6, 1] as const,
        text: "#FFFFFF",
        pressed: {
          colors: ["#0369A1", "#0C4A6E", "#082F49"] as const,
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
          locations: [0, 0.6, 1] as const,
        },
      },
    },

    // Focus states
    focus: {
      borderColor: primaryDark,
      shadowColor: primaryDark,
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
  },
};

// Helper hook for easier usage with proper TypeScript support
export const useThemeColors = (
  colorScheme: "light" | "dark" | null | undefined
): ColorTheme => {
  return Colors[colorScheme ?? "light"];
};
