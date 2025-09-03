import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bus, generateAllSeatNumbers, getAvailableSeats } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Location {
  id: string;
  name: string;
  region: string;
  type: "city" | "region" | "station";
  popular?: boolean;
}

interface PassengerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  idNumber: string;
}

interface SeatMap {
  [key: string]: {
    isOccupied: boolean;
    isSelected: boolean;
    seatNumber: string;
  };
}

const BookingScreen = () => {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  // Parse the route params
  const bus: Bus = JSON.parse(params.busData as string);
  const selectedBusType: string =
    (params.selectedBusType as string) || "Classic";
  const selectedDestinationFromSearch: string =
    (params.selectedDestination as string) || "";
  const selectedLocation: Location | null = params.selectedLocationData
    ? JSON.parse(params.selectedLocationData as string)
    : null;
  const selectedDate: Date = new Date(
    JSON.parse(params.selectedDateData as string)
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  // Updated to use the actual departure structure with calculated available seats
  const [selectedDeparturePoint, setSelectedDeparturePoint] = useState<
    Bus["departure"][0] & { availableSeats: { Classic: number; VIP: number } }
  >(() => {
    if (bus.departure && bus.departure.length > 0) {
      const firstDeparture = bus.departure[0];
      return {
        ...firstDeparture,
        availableSeats: {
          Classic: getAvailableSeats(firstDeparture, "Classic"),
          VIP: getAvailableSeats(firstDeparture, "VIP"),
        },
      };
    }
    return {
      location: "Main Station",
      seatsTaken: { Classic: [], VIP: [] },
      availableSeats: { Classic: 0, VIP: 0 },
    };
  });

  const [selectedDestination, setSelectedDestination] = useState<string>(
    selectedDestinationFromSearch || bus.routeDestination[0] || ""
  );

  const [selectedBusTypeState, setSelectedBusTypeState] = useState<
    "Classic" | "VIP"
  >(selectedBusType === "Classic" ? "Classic" : "VIP");

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: `${user?.firstName || ""} `,
    lastName: `${user?.lastName || ""}`,
    phone: "",
    email: "",
    idNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "mobile" | "card" | "cash"
  >("mobile");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Get current price based on selected bus type
  const getCurrentPrice = () => {
    if (selectedBusTypeState === "Classic") {
      return bus.price.CL;
    } else {
      return bus.price.VIP;
    }
  };

  // Get arrival locations for selected destination
  const getArrivalLocations = () => {
    const destinationInfo = bus.arrival.find(
      (arr) => arr.city === selectedDestination
    );
    return destinationInfo?.locations || [];
  };

  const [selectedArrivalPoint, setSelectedArrivalPoint] = useState<string>(
    getArrivalLocations()[0] || ""
  );

  // Generate seat map based on selected departure point and bus type
  const generateSeatMap = (): SeatMap => {
    const seatMap: SeatMap = {};
    const allSeats = generateAllSeatNumbers();
    const takenSeats =
      selectedDeparturePoint.seatsTaken[selectedBusTypeState] || [];

    // Generate all seats
    allSeats.forEach((seatNumber) => {
      seatMap[seatNumber] = {
        isOccupied: takenSeats.includes(seatNumber),
        isSelected: false,
        seatNumber: seatNumber,
      };
    });

    return seatMap;
  };

  const [seatMap, setSeatMap] = useState<SeatMap>(generateSeatMap());

  // Regenerate seat map when departure point or bus type changes
  useEffect(() => {
    setSeatMap(generateSeatMap());
    setSelectedSeats([]); // Clear selected seats when departure point or bus type changes
  }, [selectedDeparturePoint, selectedBusTypeState]);

  // Update the handleSeatSelect function with validation
  const handleSeatSelect = (seatNumber: string) => {
    if (seatMap[seatNumber].isOccupied) return;

    const newSeatMap = { ...seatMap };
    const isCurrentlySelected = selectedSeats.includes(seatNumber);
    const maxSeatsAvailable =
      selectedDeparturePoint.availableSeats[selectedBusTypeState];

    if (isCurrentlySelected) {
      // Deselect the seat
      newSeatMap[seatNumber].isSelected = false;
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      // Check if we can select more seats
      if (selectedSeats.length >= maxSeatsAvailable) {
        Alert.alert(
          "Seats Limit Reached",
          `Only ${maxSeatsAvailable} seats are available for ${selectedBusTypeState} at ${selectedDeparturePoint.location}`
        );
        return;
      }

      // Select the seat
      newSeatMap[seatNumber].isSelected = true;
      setSelectedSeats([...selectedSeats, seatNumber]);
    }

    setSeatMap(newSeatMap);
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Update validation in handleNextStep
  const handleNextStep = () => {
    if (currentStep === 1 && selectedSeats.length === 0) {
      Alert.alert("Select Seat", "Please select at least one seat to continue");
      return;
    }

    if (currentStep === 2) {
      const { firstName, lastName, phone } = passengerInfo;
      if (!firstName || !lastName || !phone) {
        Alert.alert(
          "Missing Information",
          "Please fill in all required fields"
        );
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleConfirmBooking();
    }
  };

  // Update the confirmation alert
  const handleConfirmBooking = () => {
    const seatText =
      selectedSeats.length === 1
        ? `seat ${selectedSeats[0]}`
        : `seats ${selectedSeats.join(", ")}`;

    Alert.alert(
      "Booking Confirmed!",
      `Your ${seatText} ${
        selectedSeats.length === 1 ? "has" : "have"
      } been booked successfully from ${
        selectedDeparturePoint.location
      }. You will receive a confirmation SMS shortly.`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        paddingVertical: 20,
      }}
    >
      {[1, 2, 3].map((step) => (
        <View key={step} style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 46,
              backgroundColor:
                currentStep >= step
                  ? theme.gradients.buttonPrimary.colors[1]
                  : theme.gradients.card.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {currentStep > step ? (
              <Ionicons
                name="checkmark"
                size={16}
                color={isDark ? "#fff" : "yellow"}
              />
            ) : (
              <Text
                style={{
                  color:
                    currentStep >= step
                      ? theme.gradients.card.text
                      : theme.gradients.card.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {step}
              </Text>
            )}
          </View>
          {step < 3 && (
            <View
              style={{
                width: 40,
                height: 2,
                backgroundColor:
                  currentStep > step ? theme.tint : theme.gradients.card.border,
                marginHorizontal: 8,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );

  // Enhanced Departure Points Display Component
  const renderDeparturePointsGrid = () => (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: theme.gradients.background.text,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Choose Your Departure Point
      </Text>

      <View style={{ gap: 12 }}>
        {bus.departure.map((point, index) => {
          const availableSeats = {
            Classic: getAvailableSeats(point, "Classic"),
            VIP: getAvailableSeats(point, "VIP"),
          };
          const currentAvailable = availableSeats[selectedBusTypeState];

          return (
            <Pressable
              key={index}
              onPress={() =>
                setSelectedDeparturePoint({
                  ...point,
                  availableSeats,
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 16,
                backgroundColor:
                  selectedDeparturePoint.location === point.location
                    ? theme.tint + "20"
                    : theme.gradients.card.colors[0],
                borderWidth: 2,
                borderColor:
                  selectedDeparturePoint.location === point.location
                    ? theme.tint
                    : theme.gradients.card.border,
                shadowColor:
                  selectedDeparturePoint.location === point.location
                    ? theme.tint
                    : "transparent",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity:
                  selectedDeparturePoint.location === point.location ? 0.25 : 0,
                shadowRadius: 3.84,
                elevation:
                  selectedDeparturePoint.location === point.location ? 5 : 2,
              }}
            >
              {/* Location Info */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Ionicons
                    name="location"
                    size={18}
                    color={
                      selectedDeparturePoint.location === point.location
                        ? theme.tint
                        : theme.gradients.card.text
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: isDark ? theme.tint : theme.gradients.card.text,
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {point.location}
                  </Text>
                </View>

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
                    }}
                  >
                    {selectedBusTypeState} seats available
                  </Text>
                </View>
              </View>

              {/* Seats Available */}
              <View style={{ alignItems: "center", marginLeft: 12 }}>
                <View
                  style={{
                    backgroundColor:
                      currentAvailable > 20
                        ? theme.status.success.colors[0] + "20"
                        : currentAvailable > 10
                        ? "#F59E0B20"
                        : "#EF444420",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    minWidth: 60,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color:
                        currentAvailable > 20
                          ? theme.status.success.colors[0]
                          : currentAvailable > 10
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  >
                    {currentAvailable}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color:
                        currentAvailable > 20
                          ? theme.status.success.colors[0]
                          : currentAvailable > 10
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  >
                    SEATS
                  </Text>
                </View>

                {/* Availability Status */}
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    marginTop: 4,
                    color:
                      currentAvailable > 20
                        ? theme.status.success.colors[0]
                        : currentAvailable > 10
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                >
                  {currentAvailable > 20
                    ? "GOOD"
                    : currentAvailable > 10
                    ? "LIMITED"
                    : "FEW LEFT"}
                </Text>
              </View>

              {/* Selection Indicator */}
              {selectedDeparturePoint.location === point.location && (
                <View style={{ marginLeft: 8 }}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.tint}
                  />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Bus Type Selection */}
      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme.gradients.background.text,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Select Bus Type
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {bus.busType.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelectedBusTypeState(type as "Classic" | "VIP")}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  selectedBusTypeState === type
                    ? theme.gradients.buttonPrimary.colors[1]
                    : theme.gradients.card.colors[0],
                borderWidth: 1,
                borderColor:
                  selectedBusTypeState === type
                    ? theme.status.success.colors[0]
                    : theme.gradients.card.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    selectedBusTypeState === type
                      ? theme.gradients.buttonPrimary.text
                      : theme.gradients.card.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {type} - {type === "Classic" ? bus.price.CL : bus.price.VIP}CFA
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={theme.gradients.card.colors}
        start={theme.gradients.card.start}
        end={theme.gradients.card.end}
        locations={theme.gradients.card.locations}
        style={{
          padding: 16,
          borderRadius: 16,
          marginTop: 16,
          borderWidth: 1,
          borderColor: theme.tint + "30",
        }}
      >
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
                color: theme.gradients.card.text,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              Selected Departure Point:
            </Text>
            <Text
              style={{ color: theme.tint, fontSize: 16, fontWeight: "700" }}
            >
              {selectedDeparturePoint.location}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: theme.gradients.card.text,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              {selectedBusTypeState} Seats
            </Text>
            <Text
              style={{ color: theme.tint, fontSize: 18, fontWeight: "700" }}
            >
              {selectedDeparturePoint.availableSeats[selectedBusTypeState]}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderSeatSelection = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.gradients.background.text,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Select Your Seat
      </Text>

      {/* Departure Points Display */}
      {renderDeparturePointsGrid()}

      {/* Bus Layout */}
      <View
        style={{
          backgroundColor: theme.gradients.card.colors[0],
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}
      >
        {/* Driver Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 30,
              backgroundColor: theme.tint + "30",
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="person" size={16} color={theme.tint} />
          </View>
        </View>

        {/* Seats Grid - 14 rows with 3 left + 2 right layout */}
        <View style={{ gap: 8 }}>
          {Array.from({ length: 14 }, (_, rowIndex) => (
            <View
              key={rowIndex}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Left side seats (A, B, C) */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["A", "B", "C"].map((letter) => {
                  const seatNumber = `${rowIndex + 1}${letter}`;
                  const seat = seatMap[seatNumber];
                  if (!seat) return null;

                  return (
                    <Pressable
                      key={seatNumber}
                      onPress={() => handleSeatSelect(seatNumber)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: seat.isOccupied
                          ? theme.gradients.card.border
                          : seat.isSelected
                          ? theme.tint
                          : theme.gradients.background.colors[0],
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: seat.isSelected
                          ? theme.tint
                          : theme.gradients.card.border,
                      }}
                      disabled={seat.isOccupied}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: seat.isOccupied
                            ? theme.gradients.card.text + "60"
                            : seat.isSelected
                            ? theme.status.success.colors[0]
                            : theme.gradients.card.text,
                        }}
                      >
                        {seatNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Aisle space */}
              <View style={{ width: 20 }} />

              {/* Right side seats (D, E) */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["D", "E"].map((letter) => {
                  const seatNumber = `${rowIndex + 1}${letter}`;
                  const seat = seatMap[seatNumber];
                  if (!seat) return null;

                  return (
                    <Pressable
                      key={seatNumber}
                      onPress={() => handleSeatSelect(seatNumber)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: seat.isOccupied
                          ? theme.gradients.card.border
                          : seat.isSelected
                          ? theme.tint
                          : theme.gradients.background.colors[0],
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: seat.isSelected
                          ? theme.tint
                          : theme.gradients.card.border,
                      }}
                      disabled={seat.isOccupied}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: seat.isOccupied
                            ? theme.gradients.card.text + "60"
                            : seat.isSelected
                            ? theme.status.success.colors[0]
                            : theme.gradients.card.text,
                        }}
                      >
                        {seatNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Seat Legend */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: theme.gradients.background.colors[0],
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
              marginRight: 8,
            }}
          />
          <Text
            style={{ color: theme.gradients.background.text, fontSize: 12 }}
          >
            Available
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: theme.tint,
              borderRadius: 4,
              marginRight: 8,
            }}
          />
          <Text
            style={{ color: theme.gradients.background.text, fontSize: 12 }}
          >
            Selected
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 20,
              height: 20,
              backgroundColor: theme.gradients.card.border,
              borderRadius: 4,
              marginRight: 8,
            }}
          />
          <Text
            style={{ color: theme.gradients.background.text, fontSize: 12 }}
          >
            Occupied
          </Text>
        </View>
      </View>

      {/* Selected Seat Info */}
      {selectedSeats.length > 0 && (
        <LinearGradient
          colors={theme.gradients.card.colors}
          start={theme.gradients.card.start}
          end={theme.gradients.card.end}
          locations={theme.gradients.card.locations}
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.tint + "30",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: theme.gradients.card.text,
              textAlign: "center",
            }}
          >
            Selected:
            {selectedSeats.length === 1
              ? ` Seat ${selectedSeats[0]}`
              : ` ${selectedSeats.length} Seats (${selectedSeats.join(", ")})`}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.tint,
              textAlign: "center",
              marginTop: 4,
              fontWeight: "600",
            }}
          >
            Total: {(getCurrentPrice() * selectedSeats.length).toLocaleString()}
            CFA
          </Text>
        </LinearGradient>
      )}
    </View>
  );

  const renderPassengerInfo = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.gradients.background.text,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Passenger Information
      </Text>

      {/* Destination Selection - Only show if not pre-selected from search */}
      {!selectedDestinationFromSearch && (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginBottom: 8,
            }}
          >
            Destination
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bus.routeDestination.map((destination) => (
              <Pressable
                key={destination}
                onPress={() => {
                  setSelectedDestination(destination);
                  const newArrivalLocations =
                    bus.arrival.find((arr) => arr.city === destination)
                      ?.locations || [];
                  setSelectedArrivalPoint(newArrivalLocations[0] || "");
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor:
                    selectedDestination === destination
                      ? theme.tint
                      : theme.gradients.card.colors[0],
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor:
                    selectedDestination === destination
                      ? theme.tint
                      : theme.gradients.card.border,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedDestination === destination
                        ? theme.gradients.buttonPrimary.text
                        : theme.gradients.card.text,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  {destination}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Form Fields */}
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.gradients.background.text,
                marginBottom: 8,
              }}
            >
              First Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.gradients.card.colors[0],
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: theme.gradients.card.text,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
              placeholder="Enter first name"
              placeholderTextColor={theme.gradients.card.text + "60"}
              value={passengerInfo.firstName}
              onChangeText={(text) =>
                setPassengerInfo({ ...passengerInfo, firstName: text })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.gradients.background.text,
                marginBottom: 8,
              }}
            >
              Last Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.gradients.card.colors[0],
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: theme.gradients.card.text,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
              placeholder="Enter last name"
              placeholderTextColor={theme.gradients.card.text + "60"}
              value={passengerInfo.lastName}
              onChangeText={(text) =>
                setPassengerInfo({ ...passengerInfo, lastName: text })
              }
            />
          </View>
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginBottom: 8,
            }}
          >
            Phone Number *
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: theme.gradients.card.text,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
            placeholder="Enter phone number"
            placeholderTextColor={theme.gradients.card.text + "60"}
            keyboardType="phone-pad"
            value={passengerInfo.phone}
            onChangeText={(text) =>
              setPassengerInfo({ ...passengerInfo, phone: text })
            }
          />
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginBottom: 8,
            }}
          >
            Email (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: theme.gradients.card.text,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
            placeholder="Enter email address"
            placeholderTextColor={theme.gradients.card.text + "60"}
            keyboardType="email-address"
            autoCapitalize="none"
            value={passengerInfo.email}
            onChangeText={(text) =>
              setPassengerInfo({ ...passengerInfo, email: text })
            }
          />
        </View>

        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginBottom: 8,
            }}
          >
            ID Number (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.gradients.card.colors[0],
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: theme.gradients.card.text,
              borderWidth: 1,
              borderColor: theme.gradients.card.border,
            }}
            placeholder="Enter ID number"
            placeholderTextColor={theme.gradients.card.text + "60"}
            value={passengerInfo.idNumber}
            onChangeText={(text) =>
              setPassengerInfo({ ...passengerInfo, idNumber: text })
            }
          />
        </View>
      </View>
    </View>
  );

  const renderPayment = () => (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.gradients.background.text,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Payment & Confirmation
      </Text>

      {/* Payment Methods */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.gradients.background.text,
            marginBottom: 12,
          }}
        >
          Payment Method
        </Text>

        {[
          {
            id: "mobile",
            name: "Mobile Money",
            icon: "phone-portrait",
            desc: "MTN/Orange Money",
          },
          {
            id: "card",
            name: "Credit/Debit Card",
            icon: "card",
            desc: "Visa, Mastercard",
          },
          {
            id: "cash",
            name: "Pay at Station",
            icon: "cash",
            desc: "Pay when boarding",
          },
        ].map((method) => (
          <Pressable
            key={method.id}
            onPress={() => setPaymentMethod(method.id as any)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.gradients.card.colors[0],
              padding: 16,
              borderRadius: 12,
              marginBottom: 8,
              borderWidth: 2,
              borderColor:
                paymentMethod === method.id
                  ? theme.tint
                  : theme.gradients.card.border,
            }}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={
                paymentMethod === method.id
                  ? theme.tint
                  : theme.gradients.card.text
              }
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {method.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.7,
                }}
              >
                {method.desc}
              </Text>
            </View>
            {paymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color={theme.tint} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Booking Summary */}
      <LinearGradient
        colors={theme.gradients.card.colors}
        start={theme.gradients.card.start}
        end={theme.gradients.card.end}
        locations={theme.gradients.card.locations}
        style={{
          padding: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.gradients.card.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.gradients.card.text,
            marginBottom: 16,
          }}
        >
          Booking Summary
        </Text>

        <View style={{ gap: 8 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Route
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedLocation?.name || bus.routeCity} → {selectedDestination}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Date
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedDate.toLocaleDateString()}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Time
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {bus.departureTime}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Bus Type
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedBusTypeState}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Seat{selectedSeats.length > 1 ? "s" : ""}
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedSeats.length > 0
                ? selectedSeats.join(", ")
                : "Not selected"}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Number of Seats
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedSeats.length}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Price per Seat
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {getCurrentPrice().toLocaleString()}CFA
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Departure Point
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {selectedDeparturePoint.location}
            </Text>
          </View>
          {selectedArrivalPoint && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
                Arrival Point
              </Text>
              <Text
                style={{ color: theme.gradients.card.text, fontWeight: "600" }}
              >
                {selectedArrivalPoint}
              </Text>
            </View>
          )}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ color: theme.gradients.card.text, opacity: 0.7 }}>
              Passenger
            </Text>
            <Text
              style={{ color: theme.gradients.card.text, fontWeight: "600" }}
            >
              {passengerInfo.firstName} {passengerInfo.lastName}
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: theme.gradients.card.border,
              marginVertical: 8,
            }}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                color: theme.gradients.card.text,
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Total
            </Text>
            <Text
              style={{ color: theme.tint, fontSize: 20, fontWeight: "800" }}
            >
              {(getCurrentPrice() * selectedSeats.length).toLocaleString()}CFA
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

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
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.gradients.card.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.gradients.card.colors[0],
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.gradients.background.text}
            />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: theme.gradients.background.text,
            }}
          >
            Book Your Ticket
          </Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Bus Info Card */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <LinearGradient
              colors={theme.gradients.card.colors}
              start={theme.gradients.card.start}
              end={theme.gradients.card.end}
              locations={theme.gradients.card.locations}
              style={{
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={{ uri: bus.image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    backgroundColor: theme.gradients.card.colors[0],
                  }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: theme.gradients.card.text,
                      marginBottom: 4,
                    }}
                  >
                    {selectedLocation?.name || bus.routeCity} →{" "}
                    {selectedDestination}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.gradients.card.text,
                      opacity: 0.7,
                      marginBottom: 8,
                    }}
                  >
                    {bus.departureTime} • {bus.duration} •{" "}
                    {selectedBusTypeState}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.tint,
                    }}
                  >
                    {(
                      getCurrentPrice() * selectedSeats.length
                    ).toLocaleString()}
                    CFA
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Step Content */}
          {currentStep === 1 && renderSeatSelection()}
          {currentStep === 2 && renderPassengerInfo()}
          {currentStep === 3 && renderPayment()}
        </ScrollView>

        {/* Bottom Navigation */}
        <View
          style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.gradients.card.border,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={{
                  flex: 1,
                  backgroundColor: theme.gradients.card.colors[0],
                  paddingVertical: 16,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.gradients.card.border,
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.card.text,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Back
                </Text>
              </Pressable>
            )}

            <Pressable onPress={handleNextStep} style={{ flex: 2 }}>
              <LinearGradient
                colors={theme.gradients.buttonPrimary.colors}
                start={theme.gradients.buttonPrimary.start}
                end={theme.gradients.buttonPrimary.end}
                locations={theme.gradients.buttonPrimary.locations}
                style={{
                  paddingVertical: 16,
                  borderRadius: 12,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonPrimary.text,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {currentStep === 3 ? "Confirm Booking" : "Continue"}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BookingScreen;
