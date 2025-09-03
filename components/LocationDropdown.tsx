// components/LocationDropdown.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface Location {
  id: string;
  name: string;
  region: string;
  type: "city" | "region" | "station";
  popular?: boolean;
  cityId?: string; // Add cityId for bus stations to map to their main city
}

interface LocationDropdownProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  title?: string;
  placeholder?: string;
}

// Only the 4 supported cities and their bus stations
const SUPPORTED_LOCATIONS: Location[] = [
  // Main Cities (all popular)
  { id: "1", name: "Yaoundé", region: "Centre", type: "city", popular: true },
  { id: "2", name: "Douala", region: "Littoral", type: "city", popular: true },
  {
    id: "3",
    name: "Bamenda",
    region: "Nord-Ouest",
    type: "city",
    popular: true,
  },
  { id: "4", name: "Buéa", region: "Sud-Ouest", type: "city", popular: true },

  // Bus Stations for the supported cities (with cityId mapping)
  {
    id: "5",
    name: "Gare Routière Mvog-Ada",
    region: "Centre",
    type: "station",
    cityId: "1", // Maps to Yaoundé
  },
  {
    id: "6",
    name: "Gare Routière Yaoundé",
    region: "Centre",
    type: "station",
    cityId: "1", // Maps to Yaoundé
  },
  {
    id: "7",
    name: "Biyem-Assi Station",
    region: "Centre",
    type: "station",
    cityId: "1", // Maps to Yaoundé
  },
  {
    id: "8",
    name: "Gare Routière Bonabéri",
    region: "Littoral",
    type: "station",
    cityId: "2", // Maps to Douala
  },
  {
    id: "9",
    name: "Douala International Airport",
    region: "Littoral",
    type: "station",
    cityId: "2", // Maps to Douala
  },
  {
    id: "10",
    name: "Makepe Station",
    region: "Littoral",
    type: "station",
    cityId: "2", // Maps to Douala
  },
  {
    id: "11",
    name: "Commercial Avenue Motor Park",
    region: "Nord-Ouest",
    type: "station",
    cityId: "3", // Maps to Bamenda
  },
  {
    id: "12",
    name: "Bamenda Central Station",
    region: "Nord-Ouest",
    type: "station",
    cityId: "3", // Maps to Bamenda
  },
  {
    id: "13",
    name: "Up Station Bamenda",
    region: "Nord-Ouest",
    type: "station",
    cityId: "3", // Maps to Bamenda
  },
  {
    id: "14",
    name: "Buea Motor Park",
    region: "Sud-Ouest",
    type: "station",
    cityId: "4", // Maps to Buéa
  },
  {
    id: "15",
    name: "Buea Central Station",
    region: "Sud-Ouest",
    type: "station",
    cityId: "4", // Maps to Buéa
  },
  {
    id: "16",
    name: "Mile 16 Station",
    region: "Sud-Ouest",
    type: "station",
    cityId: "4", // Maps to Buéa
  },
];

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  visible,
  onClose,
  onLocationSelect,
  selectedLocation,
  title = "Select Location",
  placeholder = "Search for cities or stations...",
}) => {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] =
    useState(SUPPORTED_LOCATIONS);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLocations(SUPPORTED_LOCATIONS);
    } else {
      const filtered = SUPPORTED_LOCATIONS.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  const popularLocations = SUPPORTED_LOCATIONS.filter((loc) => loc.popular);
  const stationLocations = SUPPORTED_LOCATIONS.filter(
    (loc) => loc.type === "station"
  );

  const handleLocationSelect = (location: Location) => {
    let selectedLocation = location;

    // If a bus station is selected, map it to its corresponding main city
    if (location.type === "station" && location.cityId) {
      const mainCity = SUPPORTED_LOCATIONS.find(
        (loc) => loc.id === location.cityId && loc.type === "city"
      );
      if (mainCity) {
        selectedLocation = mainCity;
      }
    }

    onLocationSelect(selectedLocation);
    setSearchQuery("");
    onClose();
  };

  const handleCustomAction = () => {
    // Custom button action - could open a map or location services
    console.log("Custom location action triggered");
    onClose();
  };

  const getLocationIcon = (type: Location["type"]) => {
    switch (type) {
      case "city":
        return "location";
      case "station":
        return "bus";
      case "region":
        return "map";
      default:
        return "location-outline";
    }
  };

  const isLocationSelected = (item: Location) => {
    if (!selectedLocation) return false;

    // If the item is a city, check if it's directly selected
    if (item.type === "city") {
      return selectedLocation.id === item.id;
    }

    // If the item is a station, check if its corresponding city is selected
    if (item.type === "station" && item.cityId) {
      return selectedLocation.id === item.cityId;
    }

    return false;
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <Pressable
      onPress={() => handleLocationSelect(item)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.gradients.card.border + "30",
        backgroundColor: isLocationSelected(item)
          ? theme.tint + "10"
          : "transparent",
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
          marginRight: 16,
        }}
      >
        <Ionicons
          name={getLocationIcon(item.type)}
          size={20}
          color={theme.tint}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.gradients.card.text,
            }}
          >
            {item.name}
          </Text>
          {item.popular && (
            <View
              style={{
                backgroundColor: isDark ? theme.tint + "70" : theme.tint + "30",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 10,
                marginLeft: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: isDark ? theme.tint : theme.tint + "60",
                }}
              >
                MAIN CITY
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            fontSize: 14,
            color: theme.gradients.card.text,
            opacity: 0.7,
            marginTop: 2,
          }}
        >
          {item.region} • {item.type === "city" ? "City" : "Bus Station"}
          {item.type === "station" && item.cityId && (
            <Text style={{ fontWeight: "600", opacity: 0.9 }}>
              {" → "}
              {SUPPORTED_LOCATIONS.find((loc) => loc.id === item.cityId)?.name}
            </Text>
          )}
        </Text>
      </View>

      {isLocationSelected(item) && (
        <Ionicons name="checkmark-circle" size={24} color={theme.tint} />
      )}
    </Pressable>
  );

  const renderHeader = () => (
    <View style={{ paddingBottom: 16 }}>
      {searchQuery === "" && (
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: theme.gradients.card.text,
              marginBottom: 12,
              paddingHorizontal: 20,
            }}
          >
            Main Cities
          </Text>
          {popularLocations.map((location) => (
            <View key={location.id}>
              {renderLocationItem({ item: location })}
            </View>
          ))}

          {stationLocations.length > 0 && (
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.gradients.card.text,
                marginTop: 20,
                marginBottom: 12,
                paddingHorizontal: 20,
              }}
            >
              Bus Stations
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20 }}>
      <Pressable onPress={handleCustomAction}>
        <LinearGradient
          colors={theme.gradients.buttonSecondary.colors}
          start={theme.gradients.buttonSecondary.start}
          end={theme.gradients.buttonSecondary.end}
          locations={theme.gradients.buttonSecondary.locations}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.tint + "30",
          }}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={theme.gradients.buttonSecondary.text}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.gradients.buttonSecondary.text,
              marginLeft: 8,
            }}
          >
            Use Current Location
          </Text>
        </LinearGradient>
      </Pressable>

      <Text
        style={{
          fontSize: 12,
          color: theme.gradients.card.text,
          opacity: 0.6,
          textAlign: "center",
          marginTop: 12,
        }}
      >
        We operate between Yaoundé, Douala, Bamenda & Buéa
      </Text>
    </View>
  );

  const modalHeight =
    Platform.OS === "ios"
      ? screenHeight - (StatusBar.currentHeight || 0) - 100
      : screenHeight - 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [modalHeight, 0],
                }),
              },
            ],
            opacity: animatedValue,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={theme.gradients.card.colors}
              start={theme.gradients.card.start}
              end={theme.gradients.card.end}
              locations={theme.gradients.card.locations}
              style={{
                height: modalHeight,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: theme.gradients.card.border,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.gradients.card.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.gradients.card.text,
                  }}
                >
                  {title}
                </Text>
                <Pressable
                  onPress={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.gradients.card.border,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={theme.gradients.card.text}
                  />
                </Pressable>
              </View>

              {/* Search Bar */}
              <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor:
                      theme.gradients.background.colors[0] + "50",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.gradients.card.text}
                    style={{ opacity: 0.6 }}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 16,
                      color: theme.gradients.card.text,
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={theme.gradients.card.text + "60"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="words"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={() => setSearchQuery("")}
                      style={{ marginLeft: 8 }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.gradients.card.text}
                        style={{ opacity: 0.6 }}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Locations List */}
              <FlatList
                data={searchQuery === "" ? stationLocations : filteredLocations}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={searchQuery === "" ? renderHeader : null}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={() => (
                  <View
                    style={{
                      paddingVertical: 40,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="search"
                      size={48}
                      color={theme.gradients.card.text}
                      style={{ opacity: 0.3, marginBottom: 16 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: theme.gradients.card.text,
                        marginBottom: 8,
                      }}
                    >
                      No locations found
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        textAlign: "center",
                        paddingHorizontal: 20,
                      }}
                    >
                      We currently operate between Yaoundé, Douala, Bamenda, and
                      Buéa
                    </Text>
                  </View>
                )}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default LocationDropdown;
