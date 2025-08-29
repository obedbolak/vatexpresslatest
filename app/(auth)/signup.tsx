// screens/SignUpScreen.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

interface SignUpScreenProps {
  onSignUpSuccess: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const SignUpScreen: React.FC = () => {
  // Auth context - only destructure what you need
  const {
    register,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuth();
  const { theme, isDark } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "facebook" | "apple" | null
  >(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailOrPhone, setEmailOrPhone] = useState<"phone" | "email">("phone");

  // Clear auth errors when component mounts or when user switches input type
  useEffect(() => {
    clearError();
  }, [emailOrPhone, clearError]);

  const onLoginPress = () => {
    console.log("Navigating to login screen");
    router.push("/(auth)");
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear auth error when user types
    if (authError) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email or Phone validation based on selection
    if (emailOrPhone === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    } else {
      // Phone validation
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      } else if (formData.phoneNumber.trim().length < 10) {
        newErrors.phoneNumber = "Phone number must be at least 10 digits";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailPhoneSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    // Clear any previous auth errors
    clearError();

    try {
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password,
        ...(emailOrPhone === "email"
          ? { email: formData.email.trim() }
          : { phone: formData.phoneNumber.trim() }),
      };

      console.log("Registration attempt:", registrationData);

      const success = await register(registrationData);

      if (success) {
        console.log(
          "Success!",
          "Your account has been created successfully.",
          []
        );
      } else {
        // Error is already set in the auth context
        Alert.alert(
          "Sign Up Failed",
          authError || "Something went wrong. Please try again."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Sign Up Failed", "Something went wrong. Please try again.");
    }
  };

  const handleSocialSignUp = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    setSocialLoading(provider);
    try {
      // TODO: Implement actual social signup
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log(`${provider} signup initiated`);
    } catch (error) {
      Alert.alert("Sign Up Failed", `Failed to sign up with ${provider}`);
    } finally {
      setSocialLoading(null);
    }
  };

  // Use auth loading state
  const isLoading = authLoading;

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 10 }}>
              {/* Header */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
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
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: theme.gradients.card.border,
                  }}
                >
                  <Ionicons name="person-add" size={40} color={theme.tint} />
                </LinearGradient>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: theme.gradients.background.text,
                    marginBottom: 8,
                  }}
                >
                  Create Account
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                    textAlign: "center",
                  }}
                >
                  Join thousands of Travellers using VExpress
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

              {/* Sign Up Form */}
              <View style={{ marginBottom: 24 }}>
                {/* Name Fields Row */}
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}
                >
                  {/* First Name */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.gradients.background.text,
                        marginBottom: 8,
                      }}
                    >
                      First Name
                    </Text>

                    <InputField
                      value={formData.firstName}
                      onChangeText={(value) =>
                        updateFormData("firstName", value)
                      }
                      placeholder="John"
                      icon="person-outline"
                      theme={theme}
                      error={errors.firstName}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Last Name */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.gradients.background.text,
                        marginBottom: 8,
                      }}
                    >
                      Last Name
                    </Text>

                    <InputField
                      value={formData.lastName}
                      onChangeText={(value) =>
                        updateFormData("lastName", value)
                      }
                      placeholder="Doe"
                      icon="person-outline"
                      theme={theme}
                      error={errors.lastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email Input or Phone Input */}
                <View style={{ marginBottom: 16 }}>
                  {/* Toggle Buttons */}
                  <View style={{ marginBottom: 12 }}>
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
                                  ? theme.gradients.buttonPrimary.pressed!
                                      .colors
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
                                  ? theme.gradients.buttonPrimary.pressed!
                                      .colors
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
                    </View>
                  </View>

                  {/* Input Field - Email or Phone */}
                  {emailOrPhone === "email" ? (
                    <InputField
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
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 16 }}>
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

                  <InputField
                    value={formData.password}
                    onChangeText={(value) => updateFormData("password", value)}
                    placeholder="Create a strong password"
                    icon="lock-closed-outline"
                    theme={theme}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />
                </View>

                {/* Confirm Password Input */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.gradients.background.text,
                      marginBottom: 8,
                    }}
                  >
                    Confirm Password
                  </Text>

                  <InputField
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      updateFormData("confirmPassword", value)
                    }
                    placeholder="Confirm your password"
                    icon="lock-closed-outline"
                    theme={theme}
                    error={errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    rightIcon={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    onRightIconPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                </View>

                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <PasswordStrengthIndicator
                      password={formData.password}
                      theme={theme}
                    />
                  </View>
                )}

                {/* Terms and Conditions */}
                <View style={{ marginBottom: 24 }}>
                  <Pressable
                    onPress={() => setAcceptTerms(!acceptTerms)}
                    style={{ flexDirection: "row", alignItems: "flex-start" }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: acceptTerms ? theme.tint : theme.icon,
                        backgroundColor: acceptTerms
                          ? theme.tint
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        marginTop: 2,
                      }}
                    >
                      {acceptTerms && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: theme.gradients.background.text,
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                      >
                        I agree to the{" "}
                        <Text style={{ color: theme.tint, fontWeight: "600" }}>
                          Terms of Service
                        </Text>{" "}
                        and{" "}
                        <Text style={{ color: theme.tint, fontWeight: "600" }}>
                          Privacy Policy
                        </Text>
                      </Text>

                      {errors.terms && (
                        <Text
                          style={{
                            color: theme.status.error.colors[0],
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {errors.terms}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                </View>

                {/* Sign Up Button */}
                <Pressable
                  onPress={handleEmailPhoneSignUp}
                  disabled={isLoading}
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
                          <Text
                            style={{
                              color: theme.gradients.buttonPrimary.text,
                              fontSize: 16,
                              fontWeight: "600",
                              marginRight: 8,
                            }}
                          >
                            Create Account
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
              </View>

              {/* Divider */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
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
                    or sign up with
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

              {/* Social Sign Up Buttons */}
              <View style={{ marginBottom: 24, flexDirection: "row", gap: 12 }}>
                {/* Google */}
                <SocialSignUpButton
                  provider="google"
                  onPress={() => handleSocialSignUp("google")}
                  isLoading={socialLoading === "google"}
                  theme={theme}
                />

                {/* Apple (iOS only) */}
                {Platform.OS === "ios" && (
                  <SocialSignUpButton
                    provider="apple"
                    onPress={() => handleSocialSignUp("apple")}
                    isLoading={socialLoading === "apple"}
                    theme={theme}
                  />
                )}

                {/* Facebook */}
                <SocialSignUpButton
                  provider="facebook"
                  onPress={() => handleSocialSignUp("facebook")}
                  isLoading={socialLoading === "facebook"}
                  theme={theme}
                />
              </View>

              {/* Login Link */}
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                <Text
                  style={{
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                  }}
                >
                  Already have an account?{" "}
                  <Text
                    onPress={onLoginPress}
                    style={{ color: theme.tint, fontWeight: "600" }}
                  >
                    Sign In
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

// Input Field Component
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
    <View>
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

// Password Strength Indicator
interface PasswordStrengthIndicatorProps {
  password: string;
  theme: any;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  theme,
}) => {
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    theme.status.error.colors[0],
    theme.status.error.colors[1],
    theme.status.warning.colors[0],
    theme.status.info.colors[0],
    theme.status.success.colors[0],
  ];

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 2, marginBottom: 8 }}>
        {[...Array(5)].map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor:
                index < strength ? strengthColors[strength - 1] : "#E5E7EB",
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontSize: 12,
          color: strengthColors[strength - 1] || theme.icon,
        }}
      >
        {strength > 0 ? strengthLabels[strength - 1] : "Password strength"}
      </Text>
    </View>
  );
};

// Social Sign Up Button Component
interface SocialSignUpButtonProps {
  provider: "google" | "facebook" | "apple";
  onPress: () => void;
  isLoading: boolean;
  theme: any;
}

const SocialSignUpButton: React.FC<SocialSignUpButtonProps> = ({
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
          text: "Apple",
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

export default SignUpScreen;
