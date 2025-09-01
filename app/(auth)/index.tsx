import { useAuth } from "@/contexts/AuthContext";
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
import { useTheme } from "../../contexts/ThemeContext";
import ForgotPasswordScreen from "./ForgotPasswordScreen";
import OtpVerificationScreen from "./OtpVerificationScreen";
import SignUpScreen from "./signup";

interface FormData {
  email: string;
  phoneNumber: string;
  password: string;
}

interface InputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}

// Move InputField outside component to prevent recreation on every render
const InputField: React.FC<InputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  theme,
  error,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
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
            secureTextEntry={secureTextEntry}
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
          {rightIcon && (
            <Pressable onPress={onRightIconPress} style={{ padding: 4 }}>
              <Ionicons name={rightIcon} size={20} color={theme.icon} />
            </Pressable>
          )}
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

const LoginScreen: React.FC = () => {
  const {
    login,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "facebook" | "apple" | null
  >(null);
  const [emailOrPhone, setEmailOrPhone] = useState<"phone" | "email">("email");
  const [authState, setAuthState] = useState<
    "login" | "register" | "forgot" | "otp"
  >("login");

  // State for forgot password flow
  const [resetCredential, setResetCredential] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");

  // Clear inactive field when switching between email/phone
  useEffect(() => {
    if (emailOrPhone === "email") {
      setFormData((prev) => ({ ...prev, phoneNumber: "" }));
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    } else {
      setFormData((prev) => ({ ...prev, email: "" }));
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  }, [emailOrPhone]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    const digitCount = phone.replace(/\D/g, "").length;
    return phoneRegex.test(phone) && digitCount >= 10;
  };

  const onSignUpPress = () => {
    console.log("Navigating to sign-up screen");
    setAuthState("register");
  };

  const onForgotPasswordPress = () => {
    console.log("Navigating to forgot password screen");
    setAuthState("forgot");
  };

  const handleBackToLogin = () => {
    setAuthState("login");
    // Reset forgot password states
    setResetCredential("");
    setResetMethod("email");
  };

  const handleOtpRequired = (credential: string, method: "email" | "phone") => {
    setResetCredential(credential);
    setResetMethod(method);
    setAuthState("otp");
  };

  const handlePasswordResetComplete = (newPassword: string) => {
    Alert.alert(
      "Password Reset Successful",
      "Your password has been successfully reset. Please sign in with your new password.",
      [
        {
          text: "OK",
          onPress: () => {
            setAuthState("login");
            // Optionally pre-fill the credential field
            if (resetMethod === "email") {
              setFormData((prev) => ({ ...prev, email: resetCredential }));
              setEmailOrPhone("email");
            } else {
              setFormData((prev) => ({
                ...prev,
                phoneNumber: resetCredential,
              }));
              setEmailOrPhone("phone");
            }
          },
        },
      ]
    );
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear auth error when user types
    if (authError) {
      clearError();
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});
    clearError();

    // Validate based on selected input type
    if (emailOrPhone === "email") {
      // Validate email and password
      if (!formData.email.trim() && !formData.password.trim()) {
        setErrors({ login: "Please fill in all fields" });
        setTimeout(() => {
          setErrors({ login: "" });
        }, 3000);
        return;
      }

      if (!formData.email.trim()) {
        setErrors({ email: "Please enter an email address" });
        return;
      }
      ("");

      if (!validateEmail(formData.email)) {
        setErrors({ email: "Please enter a valid email address" });
        return;
      }
    } else {
      // Validate phone and password
      if (!formData.phoneNumber.trim() || !formData.password.trim()) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }

      if (!validatePhone(formData.phoneNumber)) {
        setErrors({ phoneNumber: "Please enter a valid phone number" });
        return;
      }
    }

    // Get the login credential based on selected type
    const loginCredential =
      emailOrPhone === "email"
        ? formData.email.trim()
        : formData.phoneNumber.trim();

    try {
      const success = await login(loginCredential, formData.password.trim());

      if (!success) {
        Alert.alert("Login Failed", authError || "Invalid credentials");
      }
      // Navigation is handled automatically by AuthContext
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    }
  };

  const handleSocialLogin = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    setSocialLoading(provider);
    try {
      // TODO: Implement actual social login
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(`${provider} login initiated`);
      // Implement social login logic here
    } catch (error) {
      Alert.alert("Login Failed", `Failed to sign in with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  // Render different screens based on authState
  if (authState === "register") {
    return <SignUpScreen />;
  }

  if (authState === "forgot") {
    return (
      <ForgotPasswordScreen
        theme={theme}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onBackPress={handleBackToLogin}
        onOtpRequired={handleOtpRequired}
      />
    );
  }

  if (authState === "otp") {
    return (
      <OtpVerificationScreen
        theme={theme}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onBackPress={() => setAuthState("forgot")}
        credential={resetCredential}
        method={resetMethod}
        onVerificationComplete={handlePasswordResetComplete}
      />
    );
  }

  // Main login screen
  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity onPress={toggleTheme} style={{ zIndex: 1 }}>
          <Ionicons
            name={isDark ? "moon" : "sunny"}
            size={32}
            color={theme.tint}
            style={{
              position: "absolute",
              top: 16,
              left: 16,
            }}
          />
        </TouchableOpacity>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60 }}>
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
                  <Ionicons name="bus" size={40} color={theme.tint} />
                </LinearGradient>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: theme.gradients.background.text,
                    marginBottom: 8,
                  }}
                >
                  Welcome Back
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                    textAlign: "center",
                  }}
                >
                  Sign in to continue your transit journey
                </Text>
              </View>

              {/* Display Auth Error */}
              {authError && (
                <View
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: theme.status.error.colors[0] + "20",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.status.error.colors[0] + "40",
                  }}
                >
                  <Text
                    style={{
                      color: theme.status.error.colors[0],
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {authError}
                  </Text>
                </View>
              )}

              {/* Login Form */}
              <View style={{ marginBottom: 32 }}>
                {/* Toggle Buttons */}
                <View style={{ marginBottom: 20 }}>
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

                {/* Input Field - Email or Phone with unique keys */}
                {emailOrPhone === "email" ? (
                  <InputField
                    key="email-input" // Add unique key
                    value={formData.email}
                    onChangeText={(value) => updateFormData("email", value)}
                    placeholder="john.doe@example.com"
                    icon="mail-outline"
                    theme={theme}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                ) : (
                  <InputField
                    key="phone-input" // Add unique key
                    value={formData.phoneNumber}
                    onChangeText={(value) =>
                      updateFormData("phoneNumber", value)
                    }
                    placeholder="(123) 456-7890"
                    icon="call-outline"
                    theme={theme}
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                {/* Password Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.gradients.background.text,
                      marginBottom: 8,
                    }}
                  >
                    Password
                  </Text>

                  <LinearGradient
                    colors={theme.gradients.card.colors}
                    start={theme.gradients.card.start}
                    end={theme.gradients.card.end}
                    locations={theme.gradients.card.locations}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: theme.gradients.card.border,
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
                        name="lock-closed-outline"
                        size={20}
                        color={theme.icon}
                        style={{ marginRight: 12 }}
                      />
                      <TextInput
                        value={formData.password}
                        onChangeText={(value) =>
                          updateFormData("password", value)
                        }
                        placeholder="Enter your password"
                        placeholderTextColor={theme.icon}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={{
                          flex: 1,
                          fontSize: 16,
                          color: theme.gradients.card.text,
                          paddingVertical: 12,
                        }}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: 4 }}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color={theme.icon}
                        />
                      </Pressable>
                    </View>
                  </LinearGradient>
                </View>

                {/* Forgot Password */}
                <Pressable
                  onPress={onForgotPasswordPress}
                  style={{ alignSelf: "flex-end", marginBottom: 24 }}
                >
                  <Text
                    style={{
                      color: theme.tint,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Forgot Password?
                  </Text>
                </Pressable>

                {/* Login Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={authLoading}
                  style={{ borderRadius: 14, overflow: "hidden" }}
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
                        opacity: authLoading ? 0.7 : 1,
                      }}
                    >
                      {authLoading ? (
                        <ActivityIndicator
                          color={theme.gradients.buttonPrimary.text}
                          size="small"
                        />
                      ) : (
                        <>
                          <Text
                            style={{
                              color: theme.gradients.buttonPrimary.text,
                              fontSize: 16,
                              fontWeight: "600",
                              marginRight: 8,
                            }}
                          >
                            Sign In
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={20}
                            color={theme.gradients.buttonPrimary.text}
                          />
                        </>
                      )}
                    </LinearGradient>
                  )}
                </Pressable>
                {errors.login && (
                  <Text
                    style={{ color: "red", marginTop: 8, alignSelf: "center" }}
                  >
                    {errors.login}
                  </Text>
                )}
              </View>

              {/* Divider */}
              <View style={{ alignItems: "center", marginBottom: 32 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: isDark ? "#374151" : "#E5E7EB",
                    }}
                  />
                  <Text
                    style={{
                      marginHorizontal: 16,
                      fontSize: 14,
                      color: theme.gradients.background.text,
                      opacity: 0.6,
                    }}
                  >
                    or continue with
                  </Text>
                  <View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: isDark ? "#374151" : "#E5E7EB",
                    }}
                  />
                </View>
              </View>

              {/* Social Login Buttons */}
              <View style={{ marginBottom: 32, flexDirection: "row", gap: 16 }}>
                <SocialLoginButton
                  provider="google"
                  onPress={() => handleSocialLogin("google")}
                  isLoading={socialLoading === "google"}
                  theme={theme}
                />

                {Platform.OS === "ios" && (
                  <SocialLoginButton
                    provider="apple"
                    onPress={() => handleSocialLogin("apple")}
                    isLoading={socialLoading === "apple"}
                    theme={theme}
                  />
                )}

                <SocialLoginButton
                  provider="facebook"
                  onPress={() => handleSocialLogin("facebook")}
                  isLoading={socialLoading === "facebook"}
                  theme={theme}
                />
              </View>

              {/* Sign Up Link */}
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                <Text
                  style={{
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                  }}
                >
                  Don't have an account?
                  <Text
                    onPress={onSignUpPress}
                    style={{ color: theme.tint, fontWeight: "600" }}
                  >
                    {" Sign Up"}
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Social Login Button Component
interface SocialLoginButtonProps {
  provider: "google" | "facebook" | "apple";
  onPress: () => void;
  isLoading: boolean;
  theme: any;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  isLoading,
  theme,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case "google":
        return {
          icon: "logo-google" as const,
          text: "Google",
          colors: ["#FFFFFF", "#F8F9FA", "#F1F3F4"] as const,
          textColor: "#1F2937",
          iconColor: "#4285F4",
        };
      case "apple":
        return {
          icon: "logo-apple" as const,
          text: " Apple",
          colors: ["#000000", "#1C1C1E", "#2C2C2E"] as const,
          textColor: "#FFFFFF",
          iconColor: "#FFFFFF",
        };
      case "facebook":
        return {
          icon: "logo-facebook" as const,
          text: "Facebook",
          colors: ["#1877F2", "#166FE5", "#1464D6"] as const,
          textColor: "#FFFFFF",
          iconColor: "#FFFFFF",
        };
    }
  };

  const config = getProviderConfig();

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={{
        marginBottom: 12,
        borderRadius: 14,
        overflow: "hidden",
        width: Platform.OS === "ios" ? "30%" : "45%",
      }}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: provider === "google" ? 1 : 0,
            borderColor: theme.gradients.card.border,
            opacity: pressed ? 0.8 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={config.textColor} size="small" />
          ) : (
            <>
              <Ionicons
                name={config.icon}
                size={20}
                color={config.iconColor}
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  color: config.textColor,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {config.text}
              </Text>
            </>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
};

export default LoginScreen;
