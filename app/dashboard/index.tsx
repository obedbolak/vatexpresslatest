import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Home from "../screens/Home";
import SearchScreen from "../screens/Search";
import SettingsScreen from "../screens/Settings";
import BookingScreen from "../screens/TicketsScreen";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = 10;

const DashboardScreen: React.FC = () => {
  const [ActiveTab, setActiveTab] = useState("Home");

  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const BottomTabs = ({ theme }: any) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: theme.gradients.background.colors[1],
          bottom: 30,
          left: 40,
          position: "absolute",
          width: "80%",
          gap: 20,
        }}
      >
        <Pressable
          style={{
            alignItems: "center",
            flexDirection: "row",
          }}
          onPress={() => setActiveTab("Home")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={
              ActiveTab === "Home" ? theme.status.success.colors[0] : theme.tint
            }
          />
          {ActiveTab === "Home" && (
            <Text
              style={{
                marginLeft: 5,
                fontSize: 18,
                fontWeight: "600",
                color: theme.tint,
              }}
            >
              Home
            </Text>
          )}
        </Pressable>
        <Pressable
          style={{ alignItems: "center", flexDirection: "row" }}
          onPress={() => setActiveTab("Search")}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={
              ActiveTab === "Search"
                ? theme.status.success.colors[0]
                : theme.tint
            }
          />
          {ActiveTab === "Search" && (
            <Text
              style={{
                marginLeft: 5,
                fontSize: 18,
                fontWeight: "500",
                color: theme.tint,
              }}
            >
              Search
            </Text>
          )}
        </Pressable>
        <Pressable
          style={{ alignItems: "center", flexDirection: "row" }}
          onPress={() => setActiveTab("Bookings")}
        >
          <Ionicons
            name="ticket-outline"
            size={24}
            color={
              ActiveTab === "Bookings"
                ? theme.status.success.colors[0]
                : theme.tint
            }
          />
          {ActiveTab === "Bookings" && (
            <Text
              style={{
                marginLeft: 5,
                fontSize: 18,
                fontWeight: "500",
                color: theme.tint,
              }}
            >
              Bookings
            </Text>
          )}
        </Pressable>
        <Pressable
          style={{ alignItems: "center", flexDirection: "row" }}
          onPress={() => setActiveTab("Settings")}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={
              ActiveTab === "Settings"
                ? theme.status.success.colors[0]
                : theme.tint
            }
          />
          {ActiveTab === "Settings" && (
            <Text
              style={{
                marginLeft: 5,
                fontSize: 18,
                fontWeight: "500",
                color: theme.tint,
              }}
            >
              Settings
            </Text>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {ActiveTab === "Home" && <Home />}
        {ActiveTab === "Search" && <SearchScreen />}
        {ActiveTab === "Bookings" && <BookingScreen />}
        {ActiveTab === "Settings" && <SettingsScreen />}
        <BottomTabs theme={theme} />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DashboardScreen;
