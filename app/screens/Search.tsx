import { useTheme } from "@/contexts/ThemeContext";
import { baseBuses, Bus, getDepartureWithAvailability } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface Location {
  id: string;
  name: string;
  region: string;
  type: "city" | "region" | "station";
  popular?: boolean;
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

interface DayData {
  date: Date;
  dayName: string;
  shortName: string;
  buses: Bus[];
}

type BusType = "Classic" | "VIP" | null;

// Enhanced Bus interface for filtered results
interface FilteredBus extends Bus {
  selectedBusType: "Classic" | "VIP";
  displayPrice: number;
  specificDestination: string;
  totalAvailableSeats: number;
  bestDeparturePoint: string;
}

// Generate mock data for the week
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

// Custom Location Dropdown for the 4 cities
const CityDropdown: React.FC<{
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
  title: string;
}> = ({ visible, onClose, onLocationSelect, selectedLocation, title }) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
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
            maxHeight: "60%",
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
            {title}
          </Text>

          {/* All Cities Option */}
          <Pressable
            onPress={() => {
              onLocationSelect(null as any);
              onClose();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 15,
              borderRadius: 12,
              marginBottom: 10,
              backgroundColor:
                selectedLocation === null ? theme.tint + "20" : "transparent",
            }}
          >
            <Ionicons
              name="globe-outline"
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
              All Cities
            </Text>
            {selectedLocation === null && (
              <Ionicons name="checkmark" size={20} color={theme.tint} />
            )}
          </Pressable>

          {/* City Options */}
          {MAIN_CITIES.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => {
                onLocationSelect(city);
                onClose();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor:
                  selectedLocation?.id === city.id
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
              {selectedLocation?.id === city.id && (
                <Ionicons name="checkmark" size={20} color={theme.tint} />
              )}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const SearchScreen = () => {
  const { theme, isDark } = useTheme();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showBusTypeDropdown, setShowBusTypeDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Location | null>(null);
  const [selectedBusType, setSelectedBusType] = useState<BusType>(null);
  const weekData = generateWeekData();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleDestinationSelect = (destination: Location) => {
    setSelectedDestination(destination);
  };

  const handleBusTypeSelect = (busType: BusType) => {
    setSelectedBusType(busType);
    setShowBusTypeDropdown(false);
  };

  // Enhanced filter buses with proper destination expansion and seat calculation
  const filteredBuses = useMemo(() => {
    const dayBuses = weekData[selectedDayIndex]?.buses || [];
    let filtered: FilteredBus[] = [];

    // Create entries for each bus type and each destination
    dayBuses.forEach((bus) => {
      // For each destination in the bus route
      bus.routeDestination.forEach((destination) => {
        // Check if bus has Classic type
        if (bus.busType.includes("Classic")) {
          // Calculate total available seats for Classic across all departure points
          const departuresWithAvailability = getDepartureWithAvailability(bus);
          const totalClassicSeats = departuresWithAvailability.reduce(
            (total, dept) => total + dept.availableSeats.Classic,
            0
          );

          // Find the departure point with most available Classic seats
          const bestDeparture = departuresWithAvailability.reduce(
            (best, current) =>
              current.availableSeats.Classic > best.availableSeats.Classic
                ? current
                : best
          );

          filtered.push({
            ...bus,
            id: `${bus.id}-classic-${destination.replace(/\s+/g, "")}`,
            selectedBusType: "Classic",
            displayPrice: bus.price.CL,
            specificDestination: destination,
            totalAvailableSeats: totalClassicSeats,
            bestDeparturePoint: bestDeparture.location,
          });
        }

        // Check if bus has VIP type
        if (bus.busType.includes("VIP")) {
          // Calculate total available seats for VIP across all departure points
          const departuresWithAvailability = getDepartureWithAvailability(bus);
          const totalVIPSeats = departuresWithAvailability.reduce(
            (total, dept) => total + dept.availableSeats.VIP,
            0
          );

          // Find the departure point with most available VIP seats
          const bestDeparture = departuresWithAvailability.reduce(
            (best, current) =>
              current.availableSeats.VIP > best.availableSeats.VIP
                ? current
                : best
          );

          filtered.push({
            ...bus,
            id: `${bus.id}-vip-${destination.replace(/\s+/g, "")}`,
            selectedBusType: "VIP",
            displayPrice: bus.price.VIP,
            specificDestination: destination,
            totalAvailableSeats: totalVIPSeats,
            bestDeparturePoint: bestDeparture.location,
          });
        }
      });
    });

    // Filter by departure location if selected
    if (selectedLocation) {
      filtered = filtered.filter(
        (bus) =>
          bus.routeCity.toLowerCase() === selectedLocation.name.toLowerCase()
      );
    }

    // Filter by destination if selected
    if (selectedDestination) {
      filtered = filtered.filter(
        (bus) =>
          bus.specificDestination.toLowerCase() ===
          selectedDestination.name.toLowerCase()
      );
    }

    // Filter by bus type if selected
    if (selectedBusType) {
      filtered = filtered.filter(
        (bus) => bus.selectedBusType === selectedBusType
      );
    }

    // Filter out buses with no available seats
    filtered = filtered.filter((bus) => bus.totalAvailableSeats > 0);

    return filtered;
  }, [
    weekData,
    selectedDayIndex,
    selectedLocation,
    selectedDestination,
    selectedBusType,
  ]);

  const handleBookNow = (bus: FilteredBus) => {
    router.push({
      pathname: "/screens/BookingScreen",
      params: {
        busData: JSON.stringify({
          ...bus,
          // Remove the enhanced properties to avoid confusion
          selectedBusType: undefined,
          specificDestination: undefined,
          totalAvailableSeats: undefined,
          bestDeparturePoint: undefined,
        }),
        selectedBusType: bus.selectedBusType,
        selectedDestination: bus.specificDestination,
        selectedLocationData: selectedLocation
          ? JSON.stringify(selectedLocation)
          : "",
        selectedDateData: JSON.stringify(
          weekData[selectedDayIndex].date.toISOString()
        ),
      },
    });
  };

  // Fixed renderItem function for FlatList
  const renderBusCard = ({ item }: { item: FilteredBus }) => (
    <BusListCard
      bus={item}
      theme={theme}
      selectedLocation={selectedLocation}
      selectedDestination={selectedDestination}
      selectedBusType={selectedBusType}
      onBookNow={() => handleBookNow(item)}
    />
  );

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.gradients.card.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: theme.gradients.background.text,
            }}
          >
            {selectedLocation
              ? `Buses from ${selectedLocation.name}`
              : "All Routes"}
          </Text>
        </View>
      </View>

      {/* Day Selector */}
      <View style={{ paddingVertical: 20 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
          }}
        >
          {weekData.map((day, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedDayIndex(index)}
              style={{ marginRight: 12 }}
            >
              <LinearGradient
                colors={
                  selectedDayIndex === index
                    ? theme.gradients.buttonPrimary.colors
                    : theme.gradients.card.colors
                }
                start={
                  selectedDayIndex === index
                    ? theme.gradients.buttonPrimary.start
                    : theme.gradients.card.start
                }
                end={
                  selectedDayIndex === index
                    ? theme.gradients.buttonPrimary.end
                    : theme.gradients.card.end
                }
                locations={
                  selectedDayIndex === index
                    ? theme.gradients.buttonPrimary.locations
                    : theme.gradients.card.locations
                }
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor:
                    selectedDayIndex === index
                      ? "transparent"
                      : theme.gradients.card.border,
                  minWidth: 90,
                  height: 80,
                  shadowColor:
                    selectedDayIndex === index ? theme.tint : "transparent",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: selectedDayIndex === index ? 0.25 : 0,
                  shadowRadius: 3.84,
                  elevation: selectedDayIndex === index ? 5 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      selectedDayIndex === index
                        ? theme.gradients.buttonPrimary.text
                        : theme.gradients.card.text,
                    marginBottom: 4,
                    opacity: 0.8,
                  }}
                >
                  {day.shortName}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color:
                      selectedDayIndex === index
                        ? theme.gradients.buttonPrimary.text
                        : theme.gradients.card.text,
                  }}
                >
                  {formatDate(day.date)}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Selected Day Info and Filters */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: theme.gradients.background.text,
              marginBottom: 4,
            }}
          >
            {weekData[selectedDayIndex].dayName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.gradients.background.text,
              opacity: 0.7,
            }}
          >
            {filteredBuses.length} option{filteredBuses.length !== 1 ? "s" : ""}{" "}
            available
            {selectedLocation && ` from ${selectedLocation.name}`}
            {selectedDestination && ` to ${selectedDestination.name}`}
            {selectedBusType && ` (${selectedBusType})`}
          </Text>
        </View>

        {/* Filter Buttons Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {/* Departure City Selector */}
          <TouchableOpacity
            onPress={() => setShowLocationDropdown(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.gradients.card.colors[0],
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedLocation
                ? theme.tint + "50"
                : theme.gradients.card.border,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
            }}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={
                selectedLocation ? theme.tint : theme.gradients.background.text
              }
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selectedLocation
                  ? theme.tint
                  : theme.gradients.background.text,
                marginLeft: 6,
                marginRight: 4,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {selectedLocation ? selectedLocation.name : "From"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={
                selectedLocation ? theme.tint : theme.gradients.background.text
              }
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>

          {/* Destination City Selector */}
          <TouchableOpacity
            onPress={() => setShowDestinationDropdown(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.gradients.card.colors[0],
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedDestination
                ? theme.tint + "50"
                : theme.gradients.card.border,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
            }}
          >
            <Ionicons
              name="flag-outline"
              size={16}
              color={
                selectedDestination
                  ? theme.tint
                  : theme.gradients.background.text
              }
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selectedDestination
                  ? theme.tint
                  : theme.gradients.background.text,
                marginLeft: 6,
                marginRight: 4,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {selectedDestination ? selectedDestination.name : "To"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={
                selectedDestination
                  ? theme.tint
                  : theme.gradients.background.text
              }
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>

          {/* Bus Type Selector */}
          <TouchableOpacity
            onPress={() => setShowBusTypeDropdown(true)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.gradients.card.colors[0],
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedBusType
                ? theme.tint + "50"
                : theme.gradients.card.border,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.22,
              shadowRadius: 2.22,
              elevation: 3,
            }}
          >
            <Ionicons
              name="bus-outline"
              size={16}
              color={
                selectedBusType ? theme.tint : theme.gradients.background.text
              }
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selectedBusType
                  ? theme.tint
                  : theme.gradients.background.text,
                marginLeft: 6,
                marginRight: 4,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {selectedBusType || "Type"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={12}
              color={
                selectedBusType ? theme.tint : theme.gradients.background.text
              }
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Badges */}
      {(selectedLocation || selectedDestination || selectedBusType) && (
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {/* Departure Location Badge */}
            {selectedLocation && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.tint + "15",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.tint + "30",
                }}
              >
                <Ionicons name="location" size={16} color={theme.tint} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.tint,
                    marginLeft: 6,
                    marginRight: 8,
                  }}
                >
                  From {selectedLocation.name}
                </Text>
                <Pressable
                  onPress={() => setSelectedLocation(null)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.tint,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={12}
                    color={isDark ? "black" : "#000"}
                  />
                </Pressable>
              </View>
            )}

            {/* Destination Badge */}
            {selectedDestination && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.tint + "15",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.tint + "30",
                }}
              >
                <Ionicons name="flag" size={16} color={theme.tint} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.tint,
                    marginLeft: 6,
                    marginRight: 8,
                  }}
                >
                  To {selectedDestination.name}
                </Text>
                <Pressable
                  onPress={() => setSelectedDestination(null)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.tint,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={12}
                    color={isDark ? "black" : "#000"}
                  />
                </Pressable>
              </View>
            )}

            {/* Bus Type Badge */}
            {selectedBusType && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.tint + "15",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.tint + "30",
                }}
              >
                <Ionicons name="bus" size={16} color={theme.tint} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.tint,
                    marginLeft: 6,
                    marginRight: 8,
                  }}
                >
                  {selectedBusType}
                </Text>
                <Pressable
                  onPress={() => setSelectedBusType(null)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.tint,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={12}
                    color={isDark ? "black" : "#000"}
                  />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Buses List */}
      {filteredBuses.length > 0 ? (
        <FlatList
          data={filteredBuses}
          renderItem={renderBusCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.gradients.card.colors[0],
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="bus-outline"
              size={48}
              color={theme.gradients.background.text}
              style={{ opacity: 0.5 }}
            />
          </View>
          <Text
            style={{
              fontSize: 20,
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
              fontSize: 16,
              color: theme.gradients.background.text,
              opacity: 0.6,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            {selectedLocation || selectedBusType || selectedDestination
              ? `No ${selectedBusType || ""} buses${
                  selectedLocation ? ` from ${selectedLocation.name}` : ""
                }${
                  selectedDestination ? ` to ${selectedDestination.name}` : ""
                } on ${weekData[selectedDayIndex].dayName.toLowerCase()}`
              : `No buses scheduled for ${weekData[
                  selectedDayIndex
                ].dayName.toLowerCase()}`}
          </Text>
        </View>
      )}

      {/* Location Dropdown Modal */}
      <CityDropdown
        visible={showLocationDropdown}
        onClose={() => setShowLocationDropdown(false)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        title="Select Departure City"
      />

      {/* Destination Dropdown Modal */}
      <CityDropdown
        visible={showDestinationDropdown}
        onClose={() => setShowDestinationDropdown(false)}
        onLocationSelect={handleDestinationSelect}
        selectedLocation={selectedDestination}
        title="Select Destination City"
      />

      {/* Bus Type Dropdown Modal */}
      <Modal
        visible={showBusTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBusTypeDropdown(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowBusTypeDropdown(false)}
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

            {/* All Types Option */}
            <Pressable
              onPress={() => handleBusTypeSelect(null)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor:
                  selectedBusType === null ? theme.tint + "20" : "transparent",
              }}
            >
              <Ionicons
                name="bus-outline"
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
                All Types
              </Text>
              {selectedBusType === null && (
                <Ionicons name="checkmark" size={20} color={theme.tint} />
              )}
            </Pressable>

            {/* Classic Option */}
            <Pressable
              onPress={() => handleBusTypeSelect("Classic")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor:
                  selectedBusType === "Classic"
                    ? theme.tint + "20"
                    : "transparent",
              }}
            >
              <Ionicons
                name="bus"
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
                Classic
              </Text>
              {selectedBusType === "Classic" && (
                <Ionicons name="checkmark" size={20} color={theme.tint} />
              )}
            </Pressable>

            {/* VIP Option */}
            <Pressable
              onPress={() => handleBusTypeSelect("VIP")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderRadius: 12,
                backgroundColor:
                  selectedBusType === "VIP" ? theme.tint + "20" : "transparent",
              }}
            >
              <Ionicons
                name="star"
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
                VIP
              </Text>
              {selectedBusType === "VIP" && (
                <Ionicons name="checkmark" size={20} color={theme.tint} />
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

interface BusListCardProps {
  bus: FilteredBus;
  theme: any;
  selectedLocation: Location | null;
  selectedDestination: Location | null;
  selectedBusType: "Classic" | "VIP" | null;
  onBookNow: () => void;
}

const BusListCard: React.FC<BusListCardProps> = ({
  bus,
  theme,
  selectedLocation,
  selectedDestination,
  onBookNow,
}) => {
  // Use the specific destination for this card
  const departureCity = selectedLocation?.name || bus.routeCity;
  const destinationText = bus.specificDestination;

  return (
    <LinearGradient
      colors={theme.gradients.card.colors}
      start={theme.gradients.card.start}
      end={theme.gradients.card.end}
      locations={theme.gradients.card.locations}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.gradients.card.border,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Bus Image */}
        <Image
          source={{ uri: bus.image }}
          style={{
            width: 110,
            height: 140,
            backgroundColor: theme.gradients.card.colors[0],
          }}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "column",
              marginBottom: 12,
            }}
          >
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
                {departureCity}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={theme.tint}
                style={{ marginHorizontal: 8 }}
              />

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
                {destinationText}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <LinearGradient
                colors={
                  bus.selectedBusType === "VIP"
                    ? ["#FFD700", "#FFA500"]
                    : theme.gradients.buttonSecondary.colors
                }
                start={theme.gradients.buttonSecondary.start}
                end={theme.gradients.buttonSecondary.end}
                locations={theme.gradients.buttonSecondary.locations}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color:
                      bus.selectedBusType === "VIP"
                        ? "#000"
                        : theme.gradients.buttonSecondary.text,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  {bus.selectedBusType}
                </Text>
              </LinearGradient>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: theme.tint,
                  }}
                >
                  {bus.displayPrice.toLocaleString()}CFA
                </Text>
              </View>
            </View>
          </View>

          {/* Time and Duration */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              backgroundColor: theme.gradients.background.colors[0] + "30",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.gradients.card.text,
              }}
            >
              {bus.departureTime}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={12}
              color={theme.tint}
              style={{ marginHorizontal: 6 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: theme.gradients.card.text,
              }}
            >
              {bus.arrivalTime}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: theme.gradients.card.text,
                opacity: 0.7,
                marginLeft: 6,
              }}
            >
              ({bus.duration})
            </Text>
          </View>

          {/* Bottom Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="people"
                size={14}
                color={theme.gradients.card.text}
                style={{ opacity: 0.6, marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.7,
                  fontWeight: "500",
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
                locations={theme.gradients.buttonPrimary.locations}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 10,
                  shadowColor: theme.tint,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonPrimary.text,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Book Now
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SearchScreen;
