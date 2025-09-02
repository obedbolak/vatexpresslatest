import { useTheme } from "@/contexts/ThemeContext";
import { baseBuses, Bus } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LocationDropdown from "../../components/LocationDropdown";

const { width: screenWidth } = Dimensions.get("window");

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

// Generate mock data for the week
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

const SearchScreen = () => {
  const { theme, isDark } = useTheme();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const weekData = generateWeekData();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    console.log("Selected location:", location);
  };

  // Filter buses based on selected location
  const filteredBuses = useMemo(() => {
    const dayBuses = weekData[selectedDayIndex]?.buses || [];

    if (!selectedLocation) {
      return dayBuses;
    }

    // Filter buses that start from the selected location
    return dayBuses.filter(
      (bus) =>
        bus.routeCity.toLowerCase() === selectedLocation.name.toLowerCase()
    );
  }, [weekData, selectedDayIndex, selectedLocation]);

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

  // Fixed renderItem function for FlatList
  const renderBusCard = ({ item }: { item: Bus }) => (
    <BusListCard
      bus={item}
      theme={theme}
      selectedLocation={selectedLocation}
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
              : "All Buses"}
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

      {/* Selected Day Info */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
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
            {filteredBuses.length} buses available
            {selectedLocation && ` from ${selectedLocation.name}`}
          </Text>
        </View>

        {/* Location Selector Button */}
        <TouchableOpacity
          onPress={() => setShowLocationDropdown(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.gradients.card.colors[0],
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.gradients.card.border,
            maxWidth: 160,
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
            size={18}
            color={theme.gradients.background.text}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginLeft: 6,
              marginRight: 4,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {selectedLocation ? selectedLocation.name : "Select Location"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={theme.gradients.background.text}
            style={{ opacity: 0.6 }}
          />
        </TouchableOpacity>
      </View>

      {/* Location Filter Badge */}
      {selectedLocation && (
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.tint + "15",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignSelf: "flex-start",
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
              {selectedLocation.name}
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
            {selectedLocation
              ? `No buses departing from ${selectedLocation.name} on ${weekData[
                  selectedDayIndex
                ].dayName.toLowerCase()}`
              : `No buses scheduled for ${weekData[
                  selectedDayIndex
                ].dayName.toLowerCase()}`}
          </Text>
        </View>
      )}

      {/* Location Dropdown Modal */}
      <LocationDropdown
        visible={showLocationDropdown}
        onClose={() => setShowLocationDropdown(false)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        title="Select Departure Location"
        placeholder="Search for cities, stations..."
      />
    </LinearGradient>
  );
};

interface BusListCardProps {
  bus: Bus;
  theme: any;
  selectedLocation: Location | null;
  onBookNow: () => void;
}

const BusListCard: React.FC<BusListCardProps> = ({
  bus,
  theme,
  selectedLocation,
  onBookNow,
}) => {
  // Determine the departure city to display
  const departureCity = selectedLocation?.name || bus.routeCity;

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
                {bus.routeDestination}
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
                colors={theme.gradients.buttonSecondary.colors}
                start={theme.gradients.buttonSecondary.start}
                end={theme.gradients.buttonSecondary.end}
                locations={theme.gradients.buttonSecondary.locations}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonSecondary.text,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {bus.busType}
                </Text>
              </LinearGradient>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: theme.tint,
                }}
              >
                {bus.price.toLocaleString()}CFA
              </Text>
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
                {bus.seatsAvailable} seats left
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
