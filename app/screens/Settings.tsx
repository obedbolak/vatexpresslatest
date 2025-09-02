import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const SettingsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const {
    user,
    logout,
    updateProfileImage,
    getLocalProfileImage,
    refreshUserData,
    isLoading,
  } = useAuth();

  const [localImagePath, setLocalImagePath] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Load local profile image on component mount
  useEffect(() => {
    const loadLocalImage = async () => {
      if (user?.id) {
        try {
          const localPath = await getLocalProfileImage();
          setLocalImagePath(localPath);
        } catch (error) {
          console.error("Failed to load local image:", error);
        }
      }
    };

    loadLocalImage();
  }, [user]);
  console.log(localImagePath, user);

  // Handle profile image update
  const handleImagePicker = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to update your profile picture"
        );
        return;
      }

      // Show options
      Alert.alert("Update Profile Picture", "Choose an option", [
        {
          text: "Camera",
          onPress: () => openCamera(),
        },
        {
          text: "Photo Library",
          onPress: () => openImageLibrary(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Image picker setup error:", error);
      Alert.alert("Error", "Failed to open image picker");
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is needed to take photos"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const isemailorphone = user?.email?.includes("temp")
    ? user?.phone
    : user?.email;

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await updateImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image library error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const updateImage = async (imageUri: string) => {
    try {
      setImageLoading(true);
      const success = await updateProfileImage(imageUri);

      if (success) {
        Alert.alert("Success", "Profile picture updated successfully");
        // Refresh local image path
        const newLocalPath = await getLocalProfileImage();
        setLocalImagePath(newLocalPath);
      } else {
        Alert.alert("Error", "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Image update error:", error);
      Alert.alert("Error", "Failed to update profile picture");
    } finally {
      setImageLoading(false);
    }
  };

  // Get display image (local first, then remote)
  const getDisplayImage = () => {
    if (localImagePath) {
      return localImagePath;
    }
    if (user?.profilePic?.url) {
      return user.profilePic.url;
    }
    return null;
  };

  const handleRefreshData = async () => {
    try {
      await refreshUserData();
      const newLocalPath = await getLocalProfileImage();
      setLocalImagePath(newLocalPath);
      Alert.alert("Success", "Profile data refreshed");
    } catch (error) {
      Alert.alert("Error", "Failed to refresh data");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const profileStats = [
    { label: "Total Trips", value: "12", icon: "bus-outline" },
    { label: "Distance", value: "2,450 km", icon: "location-outline" },
    { label: "Savings", value: "$340", icon: "wallet-outline" },
  ];

  const menuItems = [
    {
      label: "Edit Profile",
      icon: "person-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "Payment Methods",
      icon: "card-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "Trip History",
      icon: "time-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "Notifications",
      icon: "notifications-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "Help & Support",
      icon: "help-circle-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "App Settings",
      icon: "settings-outline",
      action: () => router.push("/(dashboard)"),
    },
    {
      label: "Refresh Data",
      icon: "refresh-outline",
      action: handleRefreshData,
    },
    {
      label: "Logout",
      icon: "log-out-outline",
      action: handleLogout,
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
              onPress={handleImagePicker}
              disabled={imageLoading}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.gradients.card.colors[0],
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
                opacity: imageLoading ? 0.6 : 1,
              }}
            >
              {imageLoading ? (
                <ActivityIndicator size="small" color={theme.tint} />
              ) : (
                <Ionicons name="camera-outline" size={24} color={theme.tint} />
              )}
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
              <Pressable
                onPress={handleImagePicker}
                disabled={imageLoading}
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
                  position: "relative",
                }}
              >
                {imageLoading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 37,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1,
                    }}
                  >
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}

                {user?.profilePic?.url ? (
                  <Image
                    source={{ uri: user?.profilePic?.url }}
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
                    {user?.firstName?.charAt(0)?.toUpperCase()}
                    {user?.lastName?.charAt(0)?.toUpperCase()}
                  </Text>
                )}

                {/* Camera Icon Overlay */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.tint,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: theme.gradients.card.colors[0],
                  }}
                >
                  <Ionicons name="camera" size={12} color="white" />
                </View>
              </Pressable>

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
                  textAlign: "center",
                }}
              >
                {isemailorphone}
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

              {/* Additional User Info */}
              {(user?.address || user?.dateOfBirth || user?.gender) && (
                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: theme.gradients.card.border,
                    width: "100%",
                  }}
                >
                  {user?.dateOfBirth && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      Born: {new Date(user.dateOfBirth).toLocaleDateString()}
                    </Text>
                  )}
                  {user?.gender && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        textAlign: "center",
                        marginBottom: 4,
                      }}
                    >
                      Gender:{" "}
                      {user.gender.charAt(0).toUpperCase() +
                        user.gender.slice(1)}
                    </Text>
                  )}
                  {user?.address?.city && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        textAlign: "center",
                      }}
                    >
                      📍 {user.address.city}, {user.address.country}
                    </Text>
                  )}
                </View>
              )}
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
                disabled={isLoading && item.label === "Refresh Data"}
                style={{
                  marginBottom: 12,
                  opacity: isLoading && item.label === "Refresh Data" ? 0.6 : 1,
                }}
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
                      {isLoading && item.label === "Refresh Data" ? (
                        <ActivityIndicator size="small" color={theme.tint} />
                      ) : (
                        <Ionicons
                          name={item.icon as any}
                          size={20}
                          color={
                            item.isDestructive
                              ? theme.status.error.colors[0]
                              : theme.tint
                          }
                        />
                      )}
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
