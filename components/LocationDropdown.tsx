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
}

interface LocationDropdownProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  title?: string;
  placeholder?: string;
}

// Cameroon locations data
const CAMEROON_LOCATIONS: Location[] = [
  // Popular Cities
  { id: "1", name: "Yaoundé", region: "Centre", type: "city", popular: true },
  { id: "2", name: "Douala", region: "Littoral", type: "city", popular: true },
  {
    id: "3",
    name: "Bamenda",
    region: "Nord-Ouest",
    type: "city",
    popular: true,
  },
  { id: "4", name: "Bafoussam", region: "Ouest", type: "city", popular: true },
  { id: "5", name: "Garoua", region: "Nord", type: "city", popular: true },
  { id: "6", name: "Bertoua", region: "Est", type: "city", popular: true },

  // Other Cities
  { id: "7", name: "Buéa", region: "Sud-Ouest", type: "city" },
  { id: "8", name: "Limbe", region: "Sud-Ouest", type: "city" },
  { id: "9", name: "Kumba", region: "Sud-Ouest", type: "city" },
  { id: "10", name: "Dschang", region: "Ouest", type: "city" },
  { id: "11", name: "Bandjoun", region: "Ouest", type: "city" },
  { id: "12", name: "Mbouda", region: "Ouest", type: "city" },
  { id: "13", name: "Kumbo", region: "Nord-Ouest", type: "city" },
  { id: "14", name: "Wum", region: "Nord-Ouest", type: "city" },
  { id: "15", name: "Ngaoundéré", region: "Nord", type: "city" },
  { id: "16", name: "Maroua", region: "Extrême-Nord", type: "city" },
  { id: "17", name: "Mokolo", region: "Extrême-Nord", type: "city" },
  { id: "18", name: "Kousseri", region: "Extrême-Nord", type: "city" },
  { id: "19", name: "Ebolowa", region: "Sud", type: "city" },
  { id: "20", name: "Kribi", region: "Sud", type: "city" },
  { id: "21", name: "Sangmélima", region: "Sud", type: "city" },
  { id: "22", name: "Ambam", region: "Sud", type: "city" },
  { id: "23", name: "Batouri", region: "Est", type: "city" },
  { id: "24", name: "Yokadouma", region: "Est", type: "city" },
  { id: "25", name: "Mbalmayo", region: "Centre", type: "city" },
  { id: "26", name: "Akonolinga", region: "Centre", type: "city" },
  { id: "27", name: "Edéa", region: "Littoral", type: "city" },
  { id: "28", name: "Nkongsamba", region: "Littoral", type: "city" },

  // Bus Stations
  {
    id: "29",
    name: "Gare Routière Mvog-Ada",
    region: "Centre",
    type: "station",
  },
  {
    id: "30",
    name: "Gare Routière Bonabéri",
    region: "Littoral",
    type: "station",
  },
  {
    id: "31",
    name: "Commercial Avenue Motor Park",
    region: "Nord-Ouest",
    type: "station",
  },
  { id: "32", name: "Bafoussam Motor Park", region: "Ouest", type: "station" },
];

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  visible,
  onClose,
  onLocationSelect,
  selectedLocation,
  title = "Select Location",
  placeholder = "Search for a city or station...",
}) => {
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] =
    useState(CAMEROON_LOCATIONS);
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
      setFilteredLocations(CAMEROON_LOCATIONS);
    } else {
      const filtered = CAMEROON_LOCATIONS.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery]);

  const popularLocations = CAMEROON_LOCATIONS.filter((loc) => loc.popular);

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
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
                POPULAR
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
          {item.region} .
          {item.type === "city"
            ? "City"
            : item.type === "station"
            ? "Bus Station"
            : "Region"}
        </Text>
      </View>

      {selectedLocation?.id === item.id && (
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
            Popular Destinations
          </Text>
          {popularLocations.map((location) => (
            <View key={location.id}>
              {renderLocationItem({ item: location })}
            </View>
          ))}

          {filteredLocations.length > popularLocations.length && (
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
              All Locations
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
        Can't find your location? We'll add it soon!
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
                data={
                  searchQuery === ""
                    ? filteredLocations.filter((loc) => !loc.popular)
                    : filteredLocations
                }
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
                      }}
                    >
                      Try adjusting your search terms
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
