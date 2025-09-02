import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Bus } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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
  const selectedLocation: Location | null = params.selectedLocationData
    ? JSON.parse(params.selectedLocationData as string)
    : null;
  const selectedDate: Date = new Date(
    JSON.parse(params.selectedDateData as string)
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedDeparturePoint, setSelectedDeparturePoint] = useState<string>(
    bus.departure && bus.departure.length > 0
      ? bus.departure[0]
      : "Main Station"
  );

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    firstName: `${user?.firstName} `,
    lastName: `${user?.lastName}`,
    phone: "",
    email: "",
    idNumber: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "mobile" | "card" | "cash"
  >("mobile");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Update the handleSeatSelect function
  const handleSeatSelect = (seatNumber: string) => {
    if (seatMap[seatNumber].isOccupied) return;

    const newSeatMap = { ...seatMap };
    const isCurrentlySelected = selectedSeats.includes(seatNumber);

    if (isCurrentlySelected) {
      // Deselect the seat
      newSeatMap[seatNumber].isSelected = false;
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
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

  // Generate seat map (simplified 2x2 layout for demo)
  const generateSeatMap = (): SeatMap => {
    const seatMap: SeatMap = {};
    const totalSeats = 40; // Standard bus capacity
    const occupiedSeats = totalSeats - (bus.seatsAvailable || 0);

    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `${Math.ceil(i / 4)}${String.fromCharCode(
        65 + ((i - 1) % 4)
      )}`;
      seatMap[seatNumber] = {
        isOccupied: i <= occupiedSeats,
        isSelected: false,
        seatNumber: seatNumber,
      };
    }
    return seatMap;
  };

  const [seatMap, setSeatMap] = useState<SeatMap>(generateSeatMap());

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
      } been booked successfully. You will receive a confirmation SMS shortly.`,
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

        {/* Seats Grid */}
        <View style={{ gap: 8 }}>
          {Array.from({ length: 10 }, (_, rowIndex) => (
            <View
              key={rowIndex}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Left side seats (A, B) */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["A", "B"].map((letter) => {
                  const seatNumber = `${rowIndex + 1}${letter}`;
                  const seat = seatMap[seatNumber];
                  if (!seat) return null;

                  return (
                    <Pressable
                      key={seatNumber}
                      onPress={() => handleSeatSelect(seatNumber)}
                      style={{
                        width: 40,
                        height: 40,
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
                          fontSize: 12,
                          fontWeight: "600",
                          color: seat.isOccupied
                            ? theme.gradients.card.text + "60"
                            : seat.isSelected
                            ? "#FFFFFF"
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

              {/* Right side seats (C, D) */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["C", "D"].map((letter) => {
                  const seatNumber = `${rowIndex + 1}${letter}`;
                  const seat = seatMap[seatNumber];
                  if (!seat) return null;

                  return (
                    <Pressable
                      key={seatNumber}
                      onPress={() => handleSeatSelect(seatNumber)}
                      style={{
                        width: 40,
                        height: 40,
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
                          fontSize: 12,
                          fontWeight: "600",
                          color: seat.isOccupied
                            ? theme.gradients.card.text + "60"
                            : seat.isSelected
                            ? "#FFFFFF"
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
      {/* Selected Seat Info Update the seat selection display */}

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
            Selected:{" "}
            {selectedSeats.length === 1
              ? `Seat ${selectedSeats[0]}`
              : `${selectedSeats.length} Seats (${selectedSeats.join(", ")})`}
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

      {/* Departure Point Selection */}
      {bus.departure && bus.departure.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.gradients.background.text,
              marginBottom: 8,
            }}
          >
            Departure Point
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bus.departure.map((point) => (
              <Pressable
                key={point}
                onPress={() => setSelectedDeparturePoint(point)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor:
                    selectedDeparturePoint === point
                      ? theme.tint
                      : theme.gradients.card.colors[0],
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor:
                    selectedDeparturePoint === point
                      ? theme.tint
                      : theme.gradients.card.border,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedDeparturePoint === point
                        ? "#FFFFFF"
                        : theme.gradients.card.text,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  {point}
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
              {selectedLocation?.name || bus.routeCity} → {bus.routeDestination}
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
              {bus.price.toLocaleString()}CFA
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
              {selectedDeparturePoint}
            </Text>
          </View>
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
              {(bus.price * selectedSeats.length).toLocaleString()}CFA
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
                    {bus.routeDestination}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.gradients.card.text,
                      opacity: 0.7,
                      marginBottom: 8,
                    }}
                  >
                    {bus.departureTime} • {bus.duration} • {bus.busType}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.tint,
                    }}
                  >
                    {bus.price * selectedSeats.length}CFA
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
