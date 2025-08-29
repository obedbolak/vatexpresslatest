import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const SearchScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <LinearGradient
      colors={theme.gradients.background.colors}
      start={theme.gradients.background.start}
      end={theme.gradients.background.end}
      locations={theme.gradients.background.locations}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: theme.gradients.background.text,
                marginBottom: 8,
              }}
            >
              Find Your Bus
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.gradients.background.text,
                opacity: 0.7,
              }}
            >
              Search for the best routes and prices
            </Text>
          </View>

          {/* Search Form */}
          <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
            <LinearGradient
              colors={theme.gradients.card.colors}
              start={theme.gradients.card.start}
              end={theme.gradients.card.end}
              locations={theme.gradients.card.locations}
              style={{
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              {/* From Location */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                    marginBottom: 8,
                  }}
                >
                  From
                </Text>
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
                    name="location-outline"
                    size={20}
                    color={theme.tint}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 16,
                      color: theme.gradients.card.text,
                    }}
                    placeholder="Enter departure city"
                    placeholderTextColor={theme.gradients.card.text + "60"}
                    value={fromLocation}
                    onChangeText={setFromLocation}
                  />
                </View>
              </View>

              {/* Swap Button */}
              <View
                style={{
                  alignItems: "center",
                  marginVertical: 8,
                }}
              >
                <Pressable
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.tint,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="swap-vertical" size={20} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* To Location */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                    marginBottom: 8,
                  }}
                >
                  To
                </Text>
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
                  <Ionicons name="location" size={20} color={theme.tint} />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontSize: 16,
                      color: theme.gradients.card.text,
                    }}
                    placeholder="Enter destination city"
                    placeholderTextColor={theme.gradients.card.text + "60"}
                    value={toLocation}
                    onChangeText={setToLocation}
                  />
                </View>
              </View>

              {/* Date Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.gradients.card.text,
                    marginBottom: 8,
                  }}
                >
                  Departure Date
                </Text>
                <Pressable
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
                    name="calendar-outline"
                    size={20}
                    color={theme.tint}
                  />
                  <Text
                    style={{
                      marginLeft: 12,
                      fontSize: 16,
                      color: theme.gradients.card.text,
                    }}
                  >
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </Pressable>
              </View>

              {/* Search Button */}
              <Pressable>
                <LinearGradient
                  colors={theme.gradients.buttonPrimary.colors}
                  start={theme.gradients.buttonPrimary.start}
                  end={theme.gradients.buttonPrimary.end}
                  locations={theme.gradients.buttonPrimary.locations}
                  style={{
                    paddingVertical: 16,
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color={theme.gradients.buttonPrimary.text}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.gradients.buttonPrimary.text,
                    }}
                  >
                    Search Buses
                  </Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>

          {/* Popular Routes */}
          <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.background.text,
                marginBottom: 15,
              }}
            >
              Popular Routes
            </Text>

            {[
              "New York → Washington DC",
              "Los Angeles → San Francisco",
              "Chicago → Detroit",
            ].map((route, index) => (
              <PopularRouteCard key={index} route={route} theme={theme} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const PopularRouteCard = ({ route, theme }: { route: string; theme: any }) => (
  <Pressable style={{ marginBottom: 12 }}>
    <LinearGradient
      colors={theme.gradients.card.colors}
      start={theme.gradients.card.start}
      end={theme.gradients.card.end}
      locations={theme.gradients.card.locations}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.gradients.card.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="bus-outline" size={20} color={theme.tint} />
        <Text
          style={{
            marginLeft: 12,
            fontSize: 14,
            fontWeight: "600",
            color: theme.gradients.card.text,
          }}
        >
          {route}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.gradients.card.text + "60"}
      />
    </LinearGradient>
  </Pressable>
);

export default SearchScreen;
