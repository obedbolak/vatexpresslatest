// screens/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  feature: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: "1",
    title: "Welcome to TransitPay",
    subtitle: "Your Digital Transit Companion",
    description:
      "Buy tickets, track buses, and navigate the city with ease. All your transit needs in one app.",
    icon: "bus-outline",
    feature: "seamless_travel",
  },
  {
    id: "2",
    title: "Instant Ticket Purchase",
    subtitle: "Tap, Pay, Go",
    description:
      "Skip the lines and buy your tickets instantly. Support for single rides, day passes, and monthly subscriptions.",
    icon: "card-outline",
    feature: "instant_tickets",
  },
  {
    id: "3",
    title: "Real-Time Tracking",
    subtitle: "Never Miss Your Ride",
    description:
      "See live bus locations, arrival times, and route updates. Plan your journey with confidence.",
    icon: "location-outline",
    feature: "live_tracking",
  },
  {
    id: "4",
    title: "QR Code Boarding",
    subtitle: "Contactless & Quick",
    description:
      "Show your QR ticket to board. Fast, secure, and environmentally friendly digital tickets.",
    icon: "qr-code-outline",
    feature: "qr_boarding",
  },
];

interface indexProps {
  onComplete: () => void;
}

const index: React.FC<indexProps> = () => {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const onComplete = () => {
    // Handle onboarding completion here
    console.log("Onboarding completed!");
    // save the onboarding state in AsyncStorage
    const onboardingState = "completed";
    AsyncStorage.setItem("onboardingState", onboardingState);
    router.replace("/(auth)");
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const onScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth
    );
    setCurrentIndex(slideIndex);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradients.background.colors}
        start={theme.gradients.background.start}
        end={theme.gradients.background.end}
        locations={theme.gradients.background.locations}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header with Skip Button */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text
                style={[
                  styles.skipText,
                  { color: theme.gradients.background.text },
                ]}
              >
                Skip
              </Text>
            </Pressable>
          </View>

          {/* Slides Container */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.scrollView}
          >
            {onboardingData.map((slide, index) => (
              <View key={slide.id} style={styles.slide}>
                {/* Icon Container with Gradient */}
                <LinearGradient
                  colors={theme.gradients.card.colors}
                  start={theme.gradients.card.start}
                  end={theme.gradients.card.end}
                  locations={theme.gradients.card.locations}
                  style={[
                    styles.iconContainer,
                    { borderColor: theme.gradients.card.border },
                  ]}
                >
                  <Ionicons name={slide.icon} size={80} color={theme.tint} />
                </LinearGradient>

                {/* Content */}
                <View style={styles.content}>
                  <Text
                    style={[
                      styles.title,
                      { color: theme.gradients.background.text },
                    ]}
                  >
                    {slide.title}
                  </Text>

                  <Text style={[styles.subtitle, { color: theme.tint }]}>
                    {slide.subtitle}
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      { color: theme.gradients.background.text },
                    ]}
                  >
                    {slide.description}
                  </Text>
                </View>

                {/* Feature Badge */}
                <LinearGradient
                  colors={theme.status.info.colors}
                  start={theme.status.info.start}
                  end={theme.status.info.end}
                  locations={theme.status.info.locations}
                  style={styles.featureBadge}
                >
                  <Text
                    style={[
                      styles.featureText,
                      { color: theme.status.info.text },
                    ]}
                  >
                    {slide.feature.replace("_", " ").toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Page Indicators */}
            <View style={styles.pagination}>
              {onboardingData.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleDotPress(index)}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === currentIndex
                          ? theme.tint
                          : isDark
                          ? "#374151"
                          : "#E5E7EB",
                    },
                  ]}
                />
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {currentIndex > 0 && (
                <Pressable
                  onPress={() => {
                    const prevIndex = currentIndex - 1;
                    setCurrentIndex(prevIndex);
                    scrollViewRef.current?.scrollTo({
                      x: prevIndex * screenWidth,
                      animated: true,
                    });
                  }}
                  style={styles.secondaryButton}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={
                        pressed
                          ? theme.gradients.buttonSecondary.pressed!.colors
                          : theme.gradients.buttonSecondary.colors
                      }
                      start={theme.gradients.buttonSecondary.start}
                      end={theme.gradients.buttonSecondary.end}
                      locations={theme.gradients.buttonSecondary.locations}
                      style={styles.buttonGradient}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={theme.gradients.buttonSecondary.text}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          { color: theme.gradients.buttonSecondary.text },
                        ]}
                      >
                        Back
                      </Text>
                    </LinearGradient>
                  )}
                </Pressable>
              )}

              <Pressable onPress={handleNext} style={styles.primaryButton}>
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
                    style={styles.buttonGradient}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.gradients.buttonPrimary.text },
                      ]}
                    >
                      {currentIndex === onboardingData.length - 1
                        ? "Get Started"
                        : "Next"}
                    </Text>
                    <Ionicons
                      name={
                        currentIndex === onboardingData.length - 1
                          ? "checkmark"
                          : "chevron-forward"
                      }
                      size={20}
                      color={theme.gradients.buttonPrimary.text}
                    />
                  </LinearGradient>
                )}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
  },
  headerSpacer: {
    flex: 1,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: 300,
  },
  featureBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
