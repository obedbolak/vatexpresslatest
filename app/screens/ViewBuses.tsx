import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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

const { width: screenWidth } = Dimensions.get("window");

interface Bus {
  id: string;
  route: string;
  departure: string;
  arrival: string;
  price: number;
  duration: string;
  busType: string;
  seatsAvailable: number;
  image: string;
  departureTime: string;
  arrivalTime: string;
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

  // Base buses data
  const baseBuses: Bus[] = [
    {
      id: "1",
      route: "Yaoundé → Douala",
      departure: "Gare Routière Mvog-Ada",
      arrival: "Gare Routière Bonabéri",
      price: 3500,
      duration: "3h 45m",
      busType: "Express",
      seatsAvailable: 12,
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
      departureTime: "06:30 AM",
      arrivalTime: "10:15 AM",
    },
    {
      id: "2",
      route: "Douala → Bafoussam",
      departure: "Gare Routière Bonabéri",
      arrival: "Gare Routière Bafoussam",
      price: 4200,
      duration: "4h 30m",
      busType: "Luxury",
      seatsAvailable: 8,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
      departureTime: "08:00 AM",
      arrivalTime: "12:30 PM",
    },
    {
      id: "3",
      route: "Yaoundé → Bamenda",
      departure: "Gare Routière Mvog-Ada",
      arrival: "Commercial Avenue Motor Park",
      price: 6500,
      duration: "6h 15m",
      busType: "Standard",
      seatsAvailable: 15,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
      departureTime: "09:00 AM",
      arrivalTime: "03:15 PM",
    },
    {
      id: "4",
      route: "Douala → Buea",
      departure: "Gare Routière Bonabéri",
      arrival: "Buea Motor Park",
      price: 2500,
      duration: "2h 30m",
      busType: "Express",
      seatsAvailable: 20,
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
      departureTime: "01:00 PM",
      arrivalTime: "03:30 PM",
    },
  ];

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
        seatsAvailable: Math.max(1, bus.seatsAvailable - i * 2), // Reduce seats for future days
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

interface ViewAllBusesProps {
  setViewAll: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewAllBuses: React.FC<ViewAllBusesProps> = ({
  setViewAll: setViewAll,
}) => {
  const { theme } = useTheme();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const weekData = generateWeekData();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderBusCard = ({ item: bus }: { item: Bus }) => (
    <BusListCard bus={bus} theme={theme} />
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
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.gradients.card.border,
        }}
      >
        <Pressable onPress={() => setViewAll(false)}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.gradients.background.text}
          />
        </Pressable>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: theme.gradients.background.text,
            marginLeft: 16,
          }}
        >
          All Buses
        </Text>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          gap: 12,
        }}
      >
        {weekData.map((day, index) => (
          <Pressable key={index} onPress={() => setSelectedDayIndex(index)}>
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
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor:
                  selectedDayIndex === index
                    ? "transparent"
                    : theme.gradients.card.border,
                minWidth: 80,
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
                }}
              >
                {day.shortName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
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
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.gradients.background.text,
            }}
          >
            {weekData[selectedDayIndex].dayName}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.gradients.background.text,
              opacity: 0.6,
            }}
          >
            {weekData[selectedDayIndex].buses.length} buses available
          </Text>
        </View>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={theme.gradients.background.text}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginLeft: 8,
            }}
          >
            Select Location
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buses List */}
      {weekData[selectedDayIndex].buses.length > 0 ? (
        <FlatList
          data={weekData[selectedDayIndex].buses}
          renderItem={renderBusCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
          <Ionicons
            name="bus-outline"
            size={64}
            color={theme.icon}
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
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
            There are no buses scheduled for
            {weekData[selectedDayIndex].dayName.toLowerCase()}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

interface BusListCardProps {
  bus: Bus;
  theme: any;
}

const BusListCard: React.FC<BusListCardProps> = ({ bus, theme }) => {
  return (
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
      <View style={{ flexDirection: "row" }}>
        {/* Bus Image */}
        <Image
          source={{ uri: bus.image }}
          style={{
            width: 100,
            height: 120,
            backgroundColor: theme.gradients.card.colors[0],
          }}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: theme.gradients.card.text,
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {bus.route}
              </Text>
              <LinearGradient
                colors={theme.gradients.buttonSecondary.colors}
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
                    color: theme.gradients.buttonSecondary.text,
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {bus.busType}
                </Text>
              </LinearGradient>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.tint,
                }}
              >
                {bus.price}CFA
              </Text>
            </View>
          </View>

          {/* Time and Duration */}
          <View
            style={{
              flexDirection: "row",
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
              {bus.departureTime}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.tint}
              style={{ marginHorizontal: 8 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.gradients.card.text,
              }}
            >
              {bus.arrivalTime}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.gradients.card.text,
                opacity: 0.6,
                marginLeft: 8,
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
            <Text
              style={{
                fontSize: 12,
                color: theme.gradients.card.text,
                opacity: 0.6,
              }}
            >
              {bus.seatsAvailable} seats left
            </Text>

            <Pressable>
              <LinearGradient
                colors={theme.gradients.buttonPrimary.colors}
                start={theme.gradients.buttonPrimary.start}
                end={theme.gradients.buttonPrimary.end}
                locations={theme.gradients.buttonPrimary.locations}
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
                    fontSize: 12,
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

export default ViewAllBuses;
