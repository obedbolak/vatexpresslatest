import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { baseBuses, Bus } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { alertsData, Booking, bookingsData } from "@/db/busData";
export interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  theme: any;
}

interface Location {
  id: string;
  name: string;
  region: string;
  type: "city" | "region" | "station";
  popular?: boolean;
}

interface DayData {
  date: Date;
  dayName: string;
  shortName: string;
  buses: Bus[];
}

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = 10;
interface setActiveTab {}

const Home = ({ setActiveTab }: { setActiveTab: any }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const generateWeekData = (): DayData[] => {
    const today = new Date();
    const weekData: DayData[] = [];

    // Generate data for 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      let dayName = "";
      if (i === 0) dayName = "Today";
      else if (i === 1) dayName = "Tomorrow";
      else dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      const shortName =
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", { weekday: "short" });

      // Simulate different bus availability for different days
      const availableBuses = baseBuses
        .filter((_, index) => {
          // Today: all buses
          if (i === 0) return true;
          // Other days: simulate some buses not available
          return (index + i) % 3 !== 0;
        })
        .map((bus) => ({
          ...bus,
          id: `${bus.id}-day${i}`,
          seatsAvailable: Math.max(1, bus.seatsAvailable - i * 2),
        }));

      weekData.push({
        date,
        dayName,
        shortName,
        buses: availableBuses,
      });
    }

    return weekData;
  };

  const weekData = generateWeekData();
  const handleBookNow = (bus: Bus) => {
    router.push({
      pathname: "/screens/BookingScreen",
      params: {
        busData: JSON.stringify(bus),
        selectedLocationData: selectedLocation
          ? JSON.stringify(selectedLocation)
          : "",
        selectedDateData: JSON.stringify(
          weekData[selectedDayIndex].date.toISOString()
        ),
      },
    });
  };
  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % baseBuses.length;

        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + CARD_MARGIN * 2),
          animated: true,
        });

        return nextIndex;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const QuickActionCard: React.FC<QuickActionCardProps> = ({
    icon,
    title,
    subtitle,
    theme,
  }) => {
    return (
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          if (title === "Find Buses") {
            setActiveTab("Search");
          } else if (title === "My Tickets") {
            setActiveTab("Bookings");
          } else if (title === "Schedule") {
            router.push("/screens/ScheduleScreen");
          }
        }}
      >
        <LinearGradient
          colors={theme.gradients.card.colors}
          start={theme.gradients.card.start}
          end={theme.gradients.card.end}
          locations={theme.gradients.card.locations}
          style={{
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.gradients.card.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.tint + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons name={icon} size={20} color={theme.tint} />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: theme.gradients.card.text,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: theme.gradients.card.text,
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            {subtitle}
          </Text>
        </LinearGradient>
      </Pressable>
    );
  };
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_MARGIN * 2));
    setCurrentIndex(index);
  };
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 10,
          marginBottom: 20,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              color: theme.gradients.background.text,
              opacity: 0.7,
            }}
          >
            Welcome back,
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: theme.gradients.background.text,
            }}
          >
            {user?.firstName} {user?.lastName}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
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
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.tint}
            />
            <Text
              style={{
                position: "absolute",
                top: 5,
                right: 4,
                fontSize: 20,
                color: isDark ? "gold" : theme.tint,
                fontWeight: "bold",
              }}
            >
              {alertsData.filter((alert) => !alert.isRead).length}
            </Text>
          </Pressable>
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
            onPress={() => toggleTheme()}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={24}
              color={theme.tint}
            />
          </Pressable>
        </View>
      </View>
      {/* dropdown then show aamsll view base on state that show the first 3 latest notifications or show all */}
      {dropdownVisible && (
        <View
          style={{
            position: "absolute",
            top: 65,
            left: 0,
            right: 0,
            zIndex: 1000,
            marginHorizontal: 20,
          }}
        >
          <LinearGradient
            colors={theme.gradients.card.colors}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
              shadowColor: theme.gradients.background.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              maxHeight: 290,
            }}
          >
            {alertsData.slice(0, 3).map((alert, index) => {
              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    setDropdownVisible(false);
                    // Handle alert tap
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: index < 2 ? 1 : 0,
                    borderBottomColor: theme.gradients.card.border + "30",
                    backgroundColor: pressed
                      ? theme.gradients.background.colors[0] + "20"
                      : "transparent",
                  })}
                >
                  {/* Alert Icon */}
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.gradients.card.border + "15",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={theme.tint}
                    />
                  </View>

                  {/* Alert Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.gradients.dropdown.text,
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                    >
                      {alert.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.dropdown.text,
                        opacity: 0.7,
                      }}
                      numberOfLines={2}
                    >
                      {alert.message}
                    </Text>
                  </View>

                  {/* Unread Indicator */}
                  {!alert.isRead && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.tint,
                        marginLeft: 8,
                      }}
                    />
                  )}
                </Pressable>
              );
            })}

            {/* View All Button */}
            <Pressable
              onPress={() => {
                setDropdownVisible(false);
                router.push("/screens/ScheduleScreen");
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 12,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: theme.gradients.card.border,
                backgroundColor: pressed ? theme.tint + "10" : "transparent",
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.tint,
                }}
              >
                View All Alerts
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      )}

      {/* Hero Section - Today's Buses */}
      <View style={{ marginBottom: 30 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 15,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.gradients.background.text,
              }}
            >
              Today's Buses
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.gradients.background.text,
                opacity: 0.6,
              }}
            >
              {getTodayDate()}
            </Text>
          </View>

          <Pressable onPress={() => setActiveTab("Search")}>
            <Text
              style={{
                fontSize: 14,
                color: theme.tint,
                fontWeight: "600",
              }}
            >
              View All
            </Text>
          </Pressable>
        </View>

        {/* Auto-scrolling Bus Cards */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={{
            paddingLeft: (screenWidth - CARD_WIDTH) / 2,
            paddingRight: (screenWidth - CARD_WIDTH) / 2,
          }}
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 3}
          decelerationRate="fast"
        >
          {baseBuses.map((bus, index) => (
            <BusCard
              key={bus.id}
              bus={bus}
              theme={theme}
              isActive={index === currentIndex}
              selectedLocation={selectedLocation}
              onBookNow={() => handleBookNow(bus)}
            />
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 15,
            gap: 8,
          }}
        >
          {baseBuses.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === currentIndex
                    ? theme.tint
                    : theme.gradients.background.text + "30",
              }}
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.gradients.background.text,
            marginBottom: 15,
          }}
        >
          Quick Actions
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <QuickActionCard
            icon="search-outline"
            title="Find Buses"
            subtitle="Search routes"
            theme={theme}
          />
          <QuickActionCard
            icon="ticket-outline"
            title="My Tickets"
            subtitle="View bookings"
            theme={theme}
          />
          <QuickActionCard
            icon="time-outline"
            title="Schedule"
            subtitle="Bus timings"
            theme={theme}
          />
        </View>
      </View>

      {/* Recent Bookings */}
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 100, // Extra space for bottom tabs
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.gradients.background.text,
            marginBottom: 15,
          }}
        >
          Recent Bookings
        </Text>

        <RecentBookingCard theme={theme} />
      </View>
    </ScrollView>
  );
};

export default Home;

interface RecentBookingCardProps {
  theme: any;
}
const RecentBookingCard: React.FC<RecentBookingCardProps> = ({ theme }) => {
  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return theme.status.success.colors[0];
      case "PENDING":
        return theme.status.warning?.colors[0] || "#F59E0B";
      case "CANCELLED":
        return theme.status.error?.colors[0] || "#EF4444";
      case "COMPLETED":
        return theme.status.info?.colors[0] || "#3B82F6";
      default:
        return theme.tint;
    }
  };

  return (
    <>
      {bookingsData.map((booking) => (
        <LinearGradient
          colors={theme.gradients.card.colors}
          start={theme.gradients.card.start}
          end={theme.gradients.card.end}
          locations={theme.gradients.card.locations}
          key={booking.id}
          style={{
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.gradients.card.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.gradients.card.text,
              }}
            >
              {booking.route.origin} → {booking.route.destination}
            </Text>
            <View
              style={{
                backgroundColor: getStatusColor(booking.status) + "20",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: getStatusColor(booking.status),
                  fontWeight: "600",
                }}
              >
                {booking.status}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {booking.date} • {booking.time}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                Seat {booking.seat} • {booking.price.toLocaleString()}
                {booking.currency}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/screens/BookingDetailsScreen",
                  params: {
                    bookingData: JSON.stringify(booking),
                  },
                });
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.tint,
                  fontWeight: "600",
                }}
              >
                View Details
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      ))}
    </>
  );
};

interface BusCardProps {
  bus: Bus;
  theme: any;
  isActive: boolean;
  selectedLocation: Location | null;
  onBookNow: () => void;
}

const BusCard: React.FC<BusCardProps> = ({
  bus,
  theme,
  isActive,
  selectedLocation,
  onBookNow,
}) => {
  const { isDark } = useTheme();
  // Determine the departure city to display
  const departureCity = selectedLocation?.name || bus.routeCity;
  return (
    <Pressable
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_MARGIN - 4.5,
        transform: [{ scale: isActive ? 1 : 0.95 }],
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <LinearGradient
        colors={theme.gradients.card.colors}
        start={theme.gradients.card.start}
        end={theme.gradients.card.end}
        locations={theme.gradients.card.locations}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.gradients.card.border,
        }}
      >
        {/* Bus Image */}
        <Image
          source={{ uri: bus.image }}
          style={{
            width: "100%",
            height: 120,
            backgroundColor: theme.gradients.card.colors[0],
          }}
          resizeMode="cover"
        />

        {/* Bus Type Badge */}
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: isDark ? theme.gradients.card.border : theme.tint,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {bus.busType}
          </Text>
        </View>

        {/* Card Content */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
              flex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: theme.gradients.card.text,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {bus.routeCity}
            </Text>

            {/* <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.tint}
              style={{ marginHorizontal: 8 }}
            /> */}

            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: theme.gradients.card.text,
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {bus.routeDestination}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                Departure
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {bus.departureTime}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Ionicons name="arrow-forward" size={16} color={theme.tint} />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {bus.duration}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                Arrival
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {bus.arrivalTime}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.tint,
                }}
              >
                {bus.price}CFA
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {bus.seatsAvailable} seats left
              </Text>
            </View>

            <Pressable onPress={() => onBookNow()}>
              <LinearGradient
                colors={theme.gradients.buttonPrimary.colors}
                start={theme.gradients.buttonPrimary.start}
                end={theme.gradients.buttonPrimary.end}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonPrimary.text,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Book Now
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
