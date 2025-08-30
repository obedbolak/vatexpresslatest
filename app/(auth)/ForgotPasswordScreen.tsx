import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ForgotPasswordProps {
  theme: any;
  isDark: boolean;
  toggleTheme: () => void;
  onBackPress: () => void;
  onOtpRequired: (credential: string, method: "email" | "phone") => void;
}

interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  theme,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <LinearGradient
        colors={theme.gradients.card.colors}
        start={theme.gradients.card.start}
        end={theme.gradients.card.end}
        locations={theme.gradients.card.locations}
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error
            ? theme.status.error.colors[0]
            : theme.gradients.card.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 4,
          }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={theme.icon}
            style={{ marginRight: 12 }}
          />
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.icon}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            style={{
              flex: 1,
              fontSize: 16,
              color: theme.gradients.card.text,
              paddingVertical: 12,
            }}
          />
        </View>
      </LinearGradient>

      {error && (
        <Text
          style={{
            color: theme.status.error.colors[0],
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const ForgotPasswordScreen: React.FC<ForgotPasswordProps> = ({
  theme,
  isDark,
  toggleTheme,
  onBackPress,
  onOtpRequired,
}) => {
  const [credential, setCredential] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState<"phone" | "email">("email");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    const digitCount = phone.replace(/\D/g, "").length;
    return phoneRegex.test(phone) && digitCount >= 10;
  };

  const handleSendCode = async () => {
    setError("");

    if (!credential.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    // Validate based on selected type
    if (emailOrPhone === "email" && !validateEmail(credential)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailOrPhone === "phone" && !validatePhone(credential)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to OTP screen
      onOtpRequired(credential, emailOrPhone);
    } catch (error) {
      Alert.alert("Error", "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredential = (value: string) => {
    setCredential(value);
    if (error) {
      setError("");
    }
  };

  // Clear credential when switching between email/phone
  useEffect(() => {
    setCredential("");
    setError("");
  }, [emailOrPhone]);

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with back button and theme toggle */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 16,
            zIndex: 1,
          }}
        >
          <TouchableOpacity onPress={onBackPress}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={theme.gradients.background.text}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={28}
              color={theme.tint}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 48 }}>
                <LinearGradient
                  colors={theme.gradients.card.colors}
                  start={theme.gradients.card.start}
                  end={theme.gradients.card.end}
                  locations={theme.gradients.card.locations}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: theme.gradients.card.border,
                  }}
                >
                  <Ionicons name="key-outline" size={40} color={theme.tint} />
                </LinearGradient>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: theme.gradients.background.text,
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Forgot Password?
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                    textAlign: "center",
                    lineHeight: 24,
                  }}
                >
                  No worries! Enter your email or phone number and we'll send
                  you a reset code
                </Text>
              </View>

              {/* Form */}
              <View style={{ marginBottom: 32 }}>
                {/* Toggle Buttons */}
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: isDark ? "#374151" : "#F3F4F6",
                      borderRadius: 8,
                      padding: 4,
                      alignSelf: "flex-start",
                      gap: 5,
                    }}
                  >
                    {/* Email Button */}
                    <Pressable
                      onPress={() => setEmailOrPhone("email")}
                      style={{ borderRadius: 6, overflow: "hidden" }}
                    >
                      {({ pressed }) => (
                        <LinearGradient
                          colors={
                            emailOrPhone === "email"
                              ? pressed
                                ? theme.gradients.buttonPrimary.pressed!.colors
                                : theme.gradients.buttonPrimary.colors
                              : (["transparent", "transparent"] as const)
                          }
                          start={theme.gradients.buttonPrimary.start}
                          end={theme.gradients.buttonPrimary.end}
                          locations={
                            emailOrPhone === "email"
                              ? theme.gradients.buttonPrimary.locations
                              : undefined
                          }
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            opacity:
                              pressed && emailOrPhone !== "email" ? 0.7 : 1,
                          }}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={16}
                            color={
                              emailOrPhone === "email"
                                ? theme.gradients.buttonPrimary.text
                                : theme.gradients.background.text
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight:
                                emailOrPhone === "email" ? "600" : "500",
                              color:
                                emailOrPhone === "email"
                                  ? theme.gradients.buttonPrimary.text
                                  : theme.gradients.background.text,
                            }}
                          >
                            Email
                          </Text>
                        </LinearGradient>
                      )}
                    </Pressable>

                    {/* Phone Button */}
                    <Pressable
                      onPress={() => setEmailOrPhone("phone")}
                      style={{ borderRadius: 6, overflow: "hidden" }}
                    >
                      {({ pressed }) => (
                        <LinearGradient
                          colors={
                            emailOrPhone === "phone"
                              ? pressed
                                ? theme.gradients.buttonPrimary.pressed!.colors
                                : theme.gradients.buttonPrimary.colors
                              : (["transparent", "transparent"] as const)
                          }
                          start={theme.gradients.buttonPrimary.start}
                          end={theme.gradients.buttonPrimary.end}
                          locations={
                            emailOrPhone === "phone"
                              ? theme.gradients.buttonPrimary.locations
                              : undefined
                          }
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            flexDirection: "row",
                            alignItems: "center",
                            opacity:
                              pressed && emailOrPhone !== "phone" ? 0.7 : 1,
                          }}
                        >
                          <Ionicons
                            name="call-outline"
                            size={16}
                            color={
                              emailOrPhone === "phone"
                                ? theme.gradients.buttonPrimary.text
                                : theme.gradients.background.text
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight:
                                emailOrPhone === "phone" ? "600" : "500",
                              color:
                                emailOrPhone === "phone"
                                  ? theme.gradients.buttonPrimary.text
                                  : theme.gradients.background.text,
                            }}
                          >
                            Phone
                          </Text>
                        </LinearGradient>
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Input Field */}
                <InputField
                  value={credential}
                  onChangeText={updateCredential}
                  placeholder={
                    emailOrPhone === "email"
                      ? "john.doe@example.com"
                      : "(123) 456-7890"
                  }
                  icon={
                    emailOrPhone === "email" ? "mail-outline" : "call-outline"
                  }
                  theme={theme}
                  error={error}
                  keyboardType={
                    emailOrPhone === "email" ? "email-address" : "phone-pad"
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Send Code Button */}
                <Pressable
                  onPress={handleSendCode}
                  disabled={isLoading}
                  style={{ borderRadius: 14, overflow: "hidden", marginTop: 8 }}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={
                        pressed
                          ? theme.gradients.buttonPrimary.pressed!.colors
                          : theme.gradients.buttonPrimary.colors
                      }
                      start={theme.gradients.buttonPrimary.start}
                      end={theme.gradients.buttonPrimary.end}
                      locations={theme.gradients.buttonPrimary.locations}
                      style={{
                        paddingVertical: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                    >
                      {isLoading ? (
                        <ActivityIndicator
                          color={theme.gradients.buttonPrimary.text}
                          size="small"
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="send-outline"
                            size={20}
                            color={theme.gradients.buttonPrimary.text}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={{
                              color: theme.gradients.buttonPrimary.text,
                              fontSize: 16,
                              fontWeight: "600",
                            }}
                          >
                            Send Reset Code
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  )}
                </Pressable>
              </View>

              {/* Back to Login */}
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                <Pressable onPress={onBackPress}>
                  <Text
                    style={{
                      color: theme.gradients.background.text,
                      opacity: 0.7,
                      fontSize: 16,
                    }}
                  >
                    Remember your password?{" "}
                    <Text style={{ color: theme.tint, fontWeight: "600" }}>
                      Sign In
                    </Text>
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen;
