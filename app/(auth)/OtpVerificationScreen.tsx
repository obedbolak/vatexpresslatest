import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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

interface OtpVerificationProps {
  theme: any;
  isDark: boolean;
  toggleTheme: () => void;
  onBackPress: () => void;
  credential: string;
  method: "email" | "phone";
  onVerificationComplete: (newPassword: string) => void;
}

interface OtpInputProps {
  theme: any;
  value: string[];
  onChange: (value: string[]) => void;
  length: number;
  error?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  theme,
  value,
  onChange,
  length,
  error = false,
}) => {
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const newValue = [...value];

    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, length);
      const newOtp = pastedText.split("");
      while (newOtp.length < length) {
        newOtp.push("");
      }
      onChange(newOtp);

      // Focus next empty field or last field
      const nextIndex = Math.min(pastedText.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single character
      newValue[index] = text;
      onChange(newValue);

      // Auto focus next field
      if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <LinearGradient
          key={index}
          colors={theme.gradients.card.colors}
          start={theme.gradients.card.start}
          end={theme.gradients.card.end}
          locations={theme.gradients.card.locations}
          style={{
            width: 50,
            height: 56,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: error
              ? theme.status.error.colors[0]
              : value[index]
              ? theme.tint
              : theme.gradients.card.border,
          }}
        >
          <TextInput
            ref={(ref) => {
              if (ref) {
                inputRefs.current[index] = ref;
              }
            }}
            value={value[index] || ""}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={length} // Allow paste
            selectTextOnFocus
            style={{
              flex: 1,
              fontSize: 24,
              fontWeight: "600",
              color: theme.gradients.card.text,
              textAlign: "center",
            }}
          />
        </LinearGradient>
      ))}
    </View>
  );
};

const OtpVerificationScreen: React.FC<OtpVerificationProps> = ({
  theme,
  isDark,
  toggleTheme,
  onBackPress,
  credential,
  method,
  onVerificationComplete,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleOtpChange = (value: string[]) => {
    setOtp(value);
    if (error) {
      setError("");
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length < 6) {
      setError("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate verification logic
          if (otpString === "123456") {
            resolve(true);
          } else {
            reject(new Error("Invalid verification code"));
          }
        }, 1500);
      });

      // Move to password reset step
      setStep("reset");
    } catch (error) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in both password fields");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onVerificationComplete(newPassword);
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        "Code Sent",
        `A new verification code has been sent to your ${method}`
      );
      setResendTimer(60);
      setCanResend(false);
      setOtp(new Array(6).fill(""));
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatCredential = (credential: string, method: "email" | "phone") => {
    if (method === "email") {
      const [name, domain] = credential.split("@");
      if (name.length > 2) {
        return `${name.slice(0, 2)}***@${domain}`;
      }
      return credential;
    } else {
      // Format phone number
      const digits = credential.replace(/\D/g, "");
      if (digits.length >= 4) {
        return `***-***-${digits.slice(-4)}`;
      }
      return credential;
    }
  };

  if (step === "reset") {
    return (
      <LinearGradient
        colors={theme.gradients.background.colors}
        start={theme.gradients.background.start}
        end={theme.gradients.background.end}
        locations={theme.gradients.background.locations}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
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
            <TouchableOpacity onPress={() => setStep("verify")}>
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
                    <Ionicons
                      name="lock-closed-outline"
                      size={40}
                      color={theme.tint}
                    />
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
                    Reset Password
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
                    Enter your new password below
                  </Text>
                </View>

                {/* Password Form */}
                <View style={{ marginBottom: 32 }}>
                  {/* New Password */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.gradients.background.text,
                        marginBottom: 8,
                      }}
                    >
                      New Password
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
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Enter new password"
                          placeholderTextColor={theme.icon}
                          secureTextEntry={!showNewPassword}
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
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name={
                              showNewPassword
                                ? "eye-off-outline"
                                : "eye-outline"
                            }
                            size={20}
                            color={theme.icon}
                          />
                        </Pressable>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Confirm Password */}
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
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Confirm new password"
                          placeholderTextColor={theme.icon}
                          secureTextEntry={!showConfirmPassword}
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
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          style={{ padding: 4 }}
                        >
                          <Ionicons
                            name={
                              showConfirmPassword
                                ? "eye-off-outline"
                                : "eye-outline"
                            }
                            size={20}
                            color={theme.icon}
                          />
                        </Pressable>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Password Requirements */}
                  <View
                    style={{
                      marginBottom: 24,
                      padding: 16,
                      backgroundColor: theme.tint + "10",
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.background.text,
                        opacity: 0.7,
                        lineHeight: 16,
                      }}
                    >
                      Password must be at least 8 characters long and contain a
                      mix of letters, numbers, and symbols.
                    </Text>
                  </View>

                  {/* Reset Password Button */}
                  <Pressable
                    onPress={handlePasswordReset}
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
                            <Ionicons
                              name="checkmark-circle-outline"
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
                              Reset Password
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    )}
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
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
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={40}
                    color={theme.tint}
                  />
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
                  Verify Code
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                    textAlign: "center",
                    lineHeight: 24,
                    marginBottom: 8,
                  }}
                >
                  We've sent a 6-digit verification code to
                </Text>

                <Text
                  style={{
                    fontSize: 16,
                    color: theme.tint,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {formatCredential(credential, method)}
                </Text>
              </View>

              {/* OTP Form */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.gradients.background.text,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  Enter Verification Code
                </Text>

                <OtpInput
                  theme={theme}
                  value={otp}
                  onChange={handleOtpChange}
                  length={6}
                  error={!!error}
                />

                {error && (
                  <Text
                    style={{
                      color: theme.status.error.colors[0],
                      fontSize: 14,
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </Text>
                )}

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerifyOtp}
                  disabled={isLoading || otp.join("").length < 6}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    opacity: otp.join("").length < 6 ? 0.5 : 1,
                  }}
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
                            name="checkmark-outline"
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
                            Verify Code
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  )}
                </Pressable>
              </View>

              {/* Resend Code */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                {!canResend ? (
                  <Text
                    style={{
                      color: theme.gradients.background.text,
                      opacity: 0.7,
                      fontSize: 14,
                    }}
                  >
                    Didn't receive the code? Resend in {resendTimer}s
                  </Text>
                ) : (
                  <Pressable
                    onPress={handleResendCode}
                    disabled={resendLoading}
                  >
                    <Text
                      style={{
                        color: theme.tint,
                        fontSize: 14,
                        fontWeight: "600",
                        opacity: resendLoading ? 0.5 : 1,
                      }}
                    >
                      {resendLoading ? "Sending..." : "Resend Code"}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Back Link */}
              <View style={{ alignItems: "center", paddingBottom: 24 }}>
                <Pressable onPress={onBackPress}>
                  <Text
                    style={{
                      color: theme.gradients.background.text,
                      opacity: 0.7,
                      fontSize: 16,
                    }}
                  >
                    Wrong {method}?{" "}
                    <Text style={{ color: theme.tint, fontWeight: "600" }}>
                      Go Back
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

export default OtpVerificationScreen;
