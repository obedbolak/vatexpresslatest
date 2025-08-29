import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const SettingsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { user, logout } = useAuth();

  const profileStats = [
    { label: "Total Trips", value: "12", icon: "bus-outline" },
    { label: "Distance", value: "2,450 km", icon: "location-outline" },
    { label: "Savings", value: "$340", icon: "wallet-outline" },
  ];

  const menuItems = [
    { label: "Edit Profile", icon: "person-outline", action: () => {} },
    { label: "Payment Methods", icon: "card-outline", action: () => {} },
    { label: "Trip History", icon: "time-outline", action: () => {} },
    { label: "Notifications", icon: "notifications-outline", action: () => {} },
    { label: "Help & Support", icon: "help-circle-outline", action: () => {} },
    { label: "Settings", icon: "settings-outline", action: () => {} },
    {
      label: "Logout",
      icon: "log-out-outline",
      action: logout,
      isDestructive: true,
    },
  ];

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 10,
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: theme.gradients.background.text,
              }}
            >
              Profile
            </Text>

            <Pressable
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.gradients.card.colors[0],
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              <Ionicons name="create-outline" size={24} color={theme.tint} />
            </Pressable>
          </View>

          {/* Profile Card */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <LinearGradient
              colors={theme.gradients.card.colors}
              start={theme.gradients.card.start}
              end={theme.gradients.card.end}
              locations={theme.gradients.card.locations}
              style={{
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
                alignItems: "center",
              }}
            >
              {/* Profile Picture */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.tint + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                  borderWidth: 3,
                  borderColor: theme.tint,
                }}
              >
                {user?.profilePic?.url ? (
                  <Image
                    source={{ uri: user.profilePic.url }}
                    style={{
                      width: 74,
                      height: 74,
                      borderRadius: 37,
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: theme.tint,
                    }}
                  >
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </Text>
                )}
              </View>

              {/* User Info */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.gradients.card.text,
                  marginBottom: 4,
                }}
              >
                {user?.firstName} {user?.lastName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                  marginBottom: 16,
                }}
              >
                {user?.email || user?.phone}
              </Text>

              {/* Verification Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: user?.isVerified
                    ? theme.status.success.colors[0] + "20"
                    : theme.status.warning.colors[0] + "20",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Ionicons
                  name={user?.isVerified ? "checkmark-circle" : "alert-circle"}
                  size={16}
                  color={
                    user?.isVerified
                      ? theme.status.success.colors[0]
                      : theme.status.warning.colors[0]
                  }
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: "600",
                    color: user?.isVerified
                      ? theme.status.success.colors[0]
                      : theme.status.warning.colors[0],
                  }}
                >
                  {user?.isVerified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Stats */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {profileStats.map((stat, index) => (
                <LinearGradient
                  key={index}
                  colors={theme.gradients.card.colors}
                  start={theme.gradients.card.start}
                  end={theme.gradients.card.end}
                  locations={theme.gradients.card.locations}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.gradients.card.border,
                  }}
                >
                  <Ionicons
                    name={stat.icon as any}
                    size={24}
                    color={theme.tint}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.gradients.card.text,
                      marginTop: 8,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.gradients.card.text,
                      opacity: 0.6,
                      textAlign: "center",
                    }}
                  >
                    {stat.label}
                  </Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* Menu Items */}
          <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.action}
                style={{ marginBottom: 12 }}
              >
                <LinearGradient
                  colors={theme.gradients.card.colors}
                  start={theme.gradients.card.start}
                  end={theme.gradients.card.end}
                  locations={theme.gradients.card.locations}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.gradients.card.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: item.isDestructive
                          ? theme.status.error.colors[0] + "20"
                          : theme.tint + "20",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={
                          item.isDestructive
                            ? theme.status.error.colors[0]
                            : theme.tint
                        }
                      />
                    </View>
                    <Text
                      style={{
                        marginLeft: 12,
                        fontSize: 16,
                        fontWeight: "600",
                        color: item.isDestructive
                          ? theme.status.error.colors[0]
                          : theme.gradients.card.text,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.gradients.card.text + "40"}
                  />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SettingsScreen;
