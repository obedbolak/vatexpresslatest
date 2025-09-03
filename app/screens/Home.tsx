import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { baseBuses, Bus, getDepartureWithAvailability } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
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

// Enhanced Bus interface for filtered results
interface FilteredBus extends Bus {
  selectedBusType: "Classic" | "VIP";
  displayPrice: number;
  specificDestination: string;
  totalAvailableSeats: number;
  bestDeparturePoint: string;
}

// Define the 4 main cities
const MAIN_CITIES = [
  {
    id: "1",
    name: "Yaoundé",
    region: "Centre",
    type: "city" as const,
    popular: true,
  },
  {
    id: "2",
    name: "Douala",
    region: "Littoral",
    type: "city" as const,
    popular: true,
  },
  {
    id: "3",
    name: "Bamenda",
    region: "Northwest",
    type: "city" as const,
    popular: true,
  },
  {
    id: "4",
    name: "Buea",
    region: "Southwest",
    type: "city" as const,
    popular: true,
  },
];

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = 10;

const Home = ({ setActiveTab }: { setActiveTab: any }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // User's current location state
  const [userLocation, setUserLocation] = useState<Location | null>({
    id: "1",
    name: "Yaoundé",
    region: "Centre",
    type: "city",
    popular: true,
  });
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Modal states for bus selection
  const [selectedBusForBooking, setSelectedBusForBooking] =
    useState<Bus | null>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [showBusTypeModal, setShowBusTypeModal] = useState(false);
  const [tempSelectedDestination, setTempSelectedDestination] =
    useState<string>("");
  const [tempSelectedBusType, setTempSelectedBusType] = useState<
    "Classic" | "VIP"
  >("Classic");

  // Initialize user location on component mount
  useEffect(() => {
    // You can set this based on user profile, GPS, or prompt user to select
    // For now, we'll show the location selection modal if no location is set
    if (!userLocation) {
      setShowLocationModal(true);
    }
  }, []);

  const generateWeekData = (): DayData[] => {
    const today = new Date();
    const weekData: DayData[] = [];

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

      // Use actual buses from database
      const availableBuses = baseBuses.map((bus) => ({
        ...bus,
        id: `${bus.id}-day${i}`,
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

  // Enhanced bus data processing with location filtering and real seat calculation
  const processedBuses = React.useMemo(() => {
    if (!userLocation) return [];

    const dayBuses = weekData[selectedDayIndex]?.buses || [];
    let processed: FilteredBus[] = [];

    // Filter buses that depart from user's location
    const locationBuses = dayBuses.filter(
      (bus) => bus.routeCity.toLowerCase() === userLocation.name.toLowerCase()
    );

    locationBuses.forEach((bus) => {
      bus.routeDestination.forEach((destination) => {
        // Calculate seat availability using your database functions
        const departuresWithAvailability = getDepartureWithAvailability(bus);

        // Classic option
        if (bus.busType.includes("Classic")) {
          const totalClassicSeats = departuresWithAvailability.reduce(
            (total, dept) => total + dept.availableSeats.Classic,
            0
          );

          const bestClassicDeparture = departuresWithAvailability.reduce(
            (best, current) =>
              current.availableSeats.Classic > best.availableSeats.Classic
                ? current
                : best
          );

          if (totalClassicSeats > 0) {
            processed.push({
              ...bus,
              id: `${bus.id}-classic-${destination.replace(/\s+/g, "")}`,
              selectedBusType: "Classic",
              displayPrice: bus.price.CL,
              specificDestination: destination,
              totalAvailableSeats: totalClassicSeats,
              bestDeparturePoint: bestClassicDeparture.location,
            });
          }
        }

        // VIP option
        if (bus.busType.includes("VIP")) {
          const totalVIPSeats = departuresWithAvailability.reduce(
            (total, dept) => total + dept.availableSeats.VIP,
            0
          );

          const bestVIPDeparture = departuresWithAvailability.reduce(
            (best, current) =>
              current.availableSeats.VIP > best.availableSeats.VIP
                ? current
                : best
          );

          if (totalVIPSeats > 0) {
            processed.push({
              ...bus,
              id: `${bus.id}-vip-${destination.replace(/\s+/g, "")}`,
              selectedBusType: "VIP",
              displayPrice: bus.price.VIP,
              specificDestination: destination,
              totalAvailableSeats: totalVIPSeats,
              bestDeparturePoint: bestVIPDeparture.location,
            });
          }
        }
      });
    });

    return processed;
  }, [weekData, selectedDayIndex, userLocation]);

  const handleLocationSelect = (location: Location) => {
    setUserLocation(location);
    setShowLocationModal(false);
  };

  const handleBookNow = (
    bus: Bus,
    busType?: "Classic" | "VIP",
    destination?: string
  ) => {
    if (bus.routeDestination.length > 1 && !destination) {
      // Show destination selection modal
      setSelectedBusForBooking(bus);
      setTempSelectedBusType(busType || "Classic");
      setShowDestinationModal(true);
      return;
    }

    if (!busType && bus.price.CL !== bus.price.VIP) {
      // Show bus type selection modal
      setSelectedBusForBooking(bus);
      setTempSelectedDestination(destination || bus.routeDestination[0]);
      setShowBusTypeModal(true);
      return;
    }

    // Navigate to booking screen with proper data structure
    const selectedBusType = busType || "Classic";
    const selectedDestination = destination || bus.routeDestination[0];

    router.push({
      pathname: "/screens/BookingScreen",
      params: {
        busData: JSON.stringify({
          ...bus,
          selectedBusType: undefined,
          specificDestination: undefined,
          totalAvailableSeats: undefined,
          bestDeparturePoint: undefined,
        }),
        selectedBusType: selectedBusType,
        selectedDestination: selectedDestination,
        selectedLocationData: userLocation ? JSON.stringify(userLocation) : "",
        selectedDateData: JSON.stringify(
          weekData[selectedDayIndex].date.toISOString()
        ),
      },
    });
  };

  const handleDestinationSelection = (destination: string) => {
    setTempSelectedDestination(destination);
    setShowDestinationModal(false);

    if (
      selectedBusForBooking &&
      selectedBusForBooking.price.CL !== selectedBusForBooking.price.VIP
    ) {
      setShowBusTypeModal(true);
    } else {
      handleBookNow(selectedBusForBooking!, tempSelectedBusType, destination);
    }
  };

  const handleBusTypeSelection = (busType: "Classic" | "VIP") => {
    setShowBusTypeModal(false);
    handleBookNow(selectedBusForBooking!, busType, tempSelectedDestination);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (processedBuses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % processedBuses.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + CARD_MARGIN * 2),
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [processedBuses.length]);

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
          {userLocation && (
            <Pressable
              onPress={() => setShowLocationModal(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Ionicons
                name="location"
                size={14}
                color={theme.tint}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: theme.tint,
                  fontWeight: "600",
                }}
              >
                {userLocation.name}
              </Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={theme.tint}
                style={{ marginLeft: 2 }}
              />
            </Pressable>
          )}
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

      {/* Notification Dropdown */}
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
            {alertsData.slice(0, 3).map((alert, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setDropdownVisible(false);
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
                  <Ionicons name="alert-circle" size={16} color={theme.tint} />
                </View>
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
            ))}

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

      {/* Hero Section - Today's Buses from User's Location */}
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
              {userLocation
                ? `Buses from ${userLocation.name}`
                : "Today's Buses"}
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

        {/* Enhanced Auto-scrolling Bus Cards */}
        {processedBuses.length > 0 ? (
          <>
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
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
              decelerationRate="fast"
            >
              {processedBuses.map((bus, index) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  theme={theme}
                  isActive={index === currentIndex}
                  userLocation={userLocation}
                  onBookNow={() =>
                    handleBookNow(
                      bus,
                      bus.selectedBusType,
                      bus.specificDestination
                    )
                  }
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
              {processedBuses.map((_, index) => (
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
          </>
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 40,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.gradients.card.colors[0],
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="bus-outline"
                size={40}
                color={theme.gradients.background.text}
                style={{ opacity: 0.5 }}
              />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.background.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No buses available
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.gradients.background.text,
                opacity: 0.6,
                textAlign: "center",
              }}
            >
              {userLocation
                ? `No buses departing from ${userLocation.name} today`
                : "Please select your location to view available buses"}
            </Text>
            {userLocation && (
              <Pressable
                onPress={() => setShowLocationModal(true)}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: theme.tint,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonPrimary.text,
                    fontWeight: "600",
                  }}
                >
                  Change Location
                </Text>
              </Pressable>
            )}
          </View>
        )}
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
          marginBottom: 100,
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

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            if (userLocation) {
              setShowLocationModal(false);
            }
          }}
        >
          <View
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 20,
              padding: 20,
              width: "85%",
              maxWidth: 350,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.card.text,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Select Your Location
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.gradients.card.text,
                opacity: 0.7,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Choose your city to see available buses
            </Text>

            {MAIN_CITIES.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => handleLocationSelect(city)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor:
                    userLocation?.id === city.id
                      ? theme.tint + "20"
                      : "transparent",
                }}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={theme.gradients.card.text}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.gradients.card.text,
                    }}
                  >
                    {city.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.gradients.card.text,
                      opacity: 0.6,
                    }}
                  >
                    {city.region} Region
                  </Text>
                </View>
                {userLocation?.id === city.id && (
                  <Ionicons name="checkmark" size={20} color={theme.tint} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Destination Selection Modal */}
      <Modal
        visible={showDestinationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDestinationModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowDestinationModal(false)}
        >
          <View
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 20,
              padding: 20,
              width: "85%",
              maxWidth: 350,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.card.text,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Select Destination
            </Text>

            {selectedBusForBooking?.routeDestination.map((destination) => (
              <Pressable
                key={destination}
                onPress={() => handleDestinationSelection(destination)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor: "transparent",
                }}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={theme.gradients.card.text}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                    flex: 1,
                  }}
                >
                  {destination}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Bus Type Selection Modal */}
      <Modal
        visible={showBusTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBusTypeModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowBusTypeModal(false)}
        >
          <View
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 20,
              padding: 20,
              width: "80%",
              maxWidth: 300,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.card.text,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Select Bus Type
            </Text>

            <Pressable
              onPress={() => handleBusTypeSelection("Classic")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor: "transparent",
              }}
            >
              <Ionicons
                name="bus"
                size={20}
                color={theme.gradients.card.text}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                  }}
                >
                  Classic
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.tint,
                    fontWeight: "600",
                  }}
                >
                  {selectedBusForBooking?.price.CL.toLocaleString()}CFA
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleBusTypeSelection("VIP")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                backgroundColor: "transparent",
              }}
            >
              <Ionicons
                name="star"
                size={20}
                color={theme.gradients.card.text}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                  }}
                >
                  VIP
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.tint,
                    fontWeight: "600",
                  }}
                >
                  {selectedBusForBooking?.price.VIP.toLocaleString()}CFA
                </Text>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
      {bookingsData.slice(0, 3).map((booking) => (
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
  bus: FilteredBus;
  theme: any;
  isActive: boolean;
  userLocation: Location | null;
  onBookNow: () => void;
}

const BusCard: React.FC<BusCardProps> = ({
  bus,
  theme,
  isActive,
  userLocation,
  onBookNow,
}) => {
  const { isDark } = useTheme();
  const departureCity = userLocation?.name || bus.routeCity;

  return (
    <Pressable
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_MARGIN - 1,
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
        <Image
          source={{ uri: bus.image }}
          style={{
            width: "100%",
            height: 120,
            backgroundColor: theme.gradients.card.colors[0],
          }}
          resizeMode="cover"
        />

        {/* Enhanced Bus Type Badge */}
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor:
              bus.selectedBusType === "VIP"
                ? "#FFD700"
                : isDark
                ? theme.gradients.card.border
                : theme.tint,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: bus.selectedBusType === "VIP" ? "#000" : "#FFFFFF",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {bus.selectedBusType}
          </Text>
        </View>

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
              {bus.specificDestination}
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
                {bus.displayPrice.toLocaleString()}CFA
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {bus.totalAvailableSeats} seats left
              </Text>
            </View>

            <Pressable onPress={onBookNow}>
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
