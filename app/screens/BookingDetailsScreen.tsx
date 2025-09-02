// screens/BookingDetailsScreen.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Booking } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const BookingDetailsScreen = () => {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams();
  const [showQR, setShowQR] = useState(true);

  // Get booking data from params
  const booking: Booking = params.bookingData
    ? JSON.parse(params.bookingData as string)
    : null;

  const fromScanner = params.fromScanner === "true";

  if (!booking) {
    return (
      <LinearGradient
        colors={theme.gradients.background.colors}
        start={theme.gradients.background.start}
        end={theme.gradients.background.end}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Ionicons
          name="document-text-outline"
          size={48}
          color={theme.gradients.background.text}
          style={{ opacity: 0.5 }}
        />
        <Text
          style={{
            fontSize: 18,
            color: theme.gradients.background.text,
            marginTop: 16,
          }}
        >
          Booking not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: theme.tint,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return theme.status.success.colors[0];
      case "PENDING":
        return theme.status.warning.colors[0];
      case "COMPLETED":
        return theme.status.info.colors[0];
      case "CANCELLED":
        return theme.status.error?.colors[0] || "#EF4444";
      default:
        return theme.gradients.card.text;
    }
  };

  const getGradientProps = (gradient: any) => {
    const colors = gradient.colors || [];
    const locations = gradient.locations || [];

    if (locations.length === colors.length && locations.length > 0) {
      return { colors, start: gradient.start, end: gradient.end, locations };
    }
    return { colors, start: gradient.start, end: gradient.end };
  };

  // Generate QR code URL with complete ticket data embedded
  const getQRCodeUrl = () => {
    // Create a compact JSON string with all ticket details
    const ticketData = {
      ref: booking.bookingReference,
      from: booking.route.origin,
      to: booking.route.destination,
      date: booking.date,
      time: booking.time,
      seat: booking.seat,
      passenger: booking.passengerName,
      price: booking.price,
      currency: booking.currency,
      status: booking.status,
      busId: booking.busId,
    };

    // Convert to JSON and encode for URL
    const jsonData = JSON.stringify(ticketData);
    const encodedData = encodeURIComponent(jsonData);

    // Generate QR code with embedded data
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎫 Bus Ticket\n\n📋 Reference: ${
          booking.bookingReference
        }\n🚌 Route: ${booking.route.origin} → ${
          booking.route.destination
        }\n📅 Date: ${booking.date} at ${booking.time}\n💺 Seat: ${
          booking.seat
        }\n👤 Passenger: ${booking.passengerName}\n📊 Status: ${
          booking.status
        }\n💰 Price: ${booking.price.toLocaleString()}${booking.currency}`,
        title: "My Bus Ticket",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownloadTicket = () => {
    Alert.alert(
      "Download Ticket",
      "Your ticket has been saved to your device. You can also access it offline.",
      [{ text: "OK" }]
    );
  };

  return (
    <LinearGradient
      {...getGradientProps(theme.gradients.background)}
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
            onPress={() => router.back()}
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
              name="arrow-back"
              size={20}
              color={theme.gradients.background.text}
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.gradients.background.text,
              }}
            >
              {fromScanner ? "Scanned Ticket" : "Ticket Details"}
            </Text>
            {fromScanner && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.background.text,
                  opacity: 0.7,
                }}
              >
                Scanned from QR code
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleShare}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.gradients.card.colors[0],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.gradients.background.text}
            />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Digital Ticket */}
          <View
            style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 }}
          >
            <LinearGradient
              {...getGradientProps(theme.gradients.card)}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
                overflow: "hidden",
              }}
            >
              {/* Ticket Header */}
              <View
                style={{
                  backgroundColor: isDark
                    ? theme.gradients.background.border
                    : theme.tint,
                  padding: 20,
                  alignItems: "center",
                }}
              >
                <Ionicons name="bus" size={32} color="white" />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "white",
                    marginTop: 8,
                  }}
                >
                  BUS TICKET
                </Text>
                <View
                  style={{
                    backgroundColor: getStatusColor(booking.status) + "40",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: "white",
                      textTransform: "uppercase",
                    }}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              {/* QR Code Section */}
              <View
                style={{
                  padding: 24,
                  alignItems: "center",
                  backgroundColor: "white",
                }}
              >
                {showQR ? (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: getQRCodeUrl() }}
                      style={{
                        width: 160,
                        height: 160,
                        borderRadius: 8,
                      }}
                      onError={() => setShowQR(false)}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#666",
                        marginTop: 8,
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {booking.bookingReference}
                    </Text>
                  </View>
                ) : (
                  // Fallback design when QR fails to load
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: 160,
                        height: 160,
                        backgroundColor: theme.tint + "20",
                        borderRadius: 12,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderStyle: "dashed",
                        borderColor: theme.tint,
                      }}
                    >
                      <Ionicons name="qr-code" size={60} color={theme.tint} />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: theme.tint,
                          marginTop: 8,
                        }}
                      >
                        {booking.bookingReference}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Ticket Details */}
              <View style={{ padding: 24 }}>
                {/* Route */}
                <View style={{ marginBottom: 24 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.gradients.card.text,
                          opacity: 0.6,
                          marginBottom: 4,
                          textTransform: "uppercase",
                          fontWeight: "600",
                        }}
                      >
                        FROM
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: theme.gradients.card.text,
                          textAlign: "center",
                        }}
                      >
                        {booking.route.origin}
                      </Text>
                    </View>

                    <View
                      style={{ alignItems: "center", paddingHorizontal: 20 }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 2,
                          backgroundColor: theme.tint,
                          position: "relative",
                        }}
                      >
                        <Text
                          style={{
                            position: "absolute",
                            top: -32,
                            transform: [{ rotateY: "180deg" }],

                            fontSize: 24,
                            color: theme.tint,
                            fontWeight: "700",
                          }}
                        >
                          🚌
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "center", flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.gradients.card.text,
                          opacity: 0.6,
                          marginBottom: 4,
                          textTransform: "uppercase",
                          fontWeight: "600",
                        }}
                      >
                        TO
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: theme.gradients.card.text,
                          textAlign: "center",
                        }}
                      >
                        {booking.route.destination}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Dotted divider */}
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: theme.gradients.card.border,
                    borderStyle: "dashed",
                    marginBottom: 20,
                  }}
                />

                {/* Trip Details Grid */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "48%", marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      DATE
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme.gradients.card.text,
                      }}
                    >
                      {booking.date}
                    </Text>
                  </View>

                  <View style={{ width: "48%", marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      TIME
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme.gradients.card.text,
                      }}
                    >
                      {booking.time}
                    </Text>
                  </View>

                  <View style={{ width: "48%", marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      SEAT
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: theme.tint,
                      }}
                    >
                      {booking.seat}
                    </Text>
                  </View>

                  <View style={{ width: "48%", marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      PRICE
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: theme.tint,
                      }}
                    >
                      {booking.price.toLocaleString()}
                      {booking.currency}
                    </Text>
                  </View>

                  <View style={{ width: "48%" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      PASSENGER
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme.gradients.card.text,
                      }}
                    >
                      {booking.passengerName}
                    </Text>
                  </View>

                  <View style={{ width: "48%" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.gradients.card.text,
                        opacity: 0.6,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        fontWeight: "600",
                      }}
                    >
                      BUS
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme.gradients.card.text,
                      }}
                    >
                      BUS{booking.busId.padStart(3, "0")}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Instructions */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <LinearGradient
              {...getGradientProps(theme.gradients.card)}
              style={{
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={theme.tint}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: theme.gradients.card.text,
                  }}
                >
                  Important Information
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: theme.gradients.card.text,
                  lineHeight: 20,
                  opacity: 0.8,
                }}
              >
                • Present this QR code when boarding{"\n"}• Arrive at the
                station 30 minutes before departure{"\n"}• Keep this ticket
                until you reach your destination{"\n"}• Contact support if you
                need to make changes
              </Text>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          {!fromScanner && (
            <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
              <View style={{ gap: 12 }}>
                <Pressable onPress={handleDownloadTicket}>
                  <LinearGradient
                    {...getGradientProps(theme.gradients.buttonPrimary)}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={theme.gradients.buttonPrimary.text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme.gradients.buttonPrimary.text,
                      }}
                    >
                      Save Ticket
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BookingDetailsScreen;
