import { Booking, bookingsData, getBookingsByStatus } from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const BookingScreen = () => {
  const { theme, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<"all" | Booking["status"]>(
    "all"
  );

  // Use your booking data
  const bookings = bookingsData;

  const filters = [
    { id: "all" as const, label: "All Tickets" },
    { id: "CONFIRMED" as const, label: "Confirmed" },
    { id: "PENDING" as const, label: "Pending" },
    { id: "COMPLETED" as const, label: "Completed" },
    { id: "CANCELLED" as const, label: "Cancelled" },
  ];

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

  // Helper function to ensure colors and locations arrays match
  const getGradientProps = (gradient: any) => {
    const colors = gradient.colors || [];
    const locations = gradient.locations || [];

    if (locations.length === colors.length && locations.length > 0) {
      return {
        colors,
        start: gradient.start,
        end: gradient.end,
        locations,
      };
    }

    return {
      colors,
      start: gradient.start,
      end: gradient.end,
    };
  };

  const TicketCard = ({ booking }: { booking: Booking }) => (
    <Pressable style={{ marginBottom: 16 }}>
      <LinearGradient
        {...getGradientProps(theme.gradients.card)}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.gradients.card.border,
        }}
      >
        {/* Ticket Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.gradients.card.border,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: theme.gradients.card.text,
              flex: 1,
            }}
          >
            {booking.route.origin} → {booking.route.destination}
          </Text>
          <View
            style={{
              backgroundColor: getStatusColor(booking.status) + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: getStatusColor(booking.status),
                textTransform: "uppercase",
              }}
            >
              {booking.status}
            </Text>
          </View>
        </View>

        {/* Ticket Details */}
        <View style={{ padding: 16 }}>
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
                Date & Time
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {booking.date} • {booking.time}
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
                Reference
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {booking.bookingReference}
              </Text>
            </View>
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
                Passenger
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {booking.passengerName}
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
                Seat & Price
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {booking.seat} • {booking.price.toLocaleString()}
                {booking.currency}
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
                Bus ID: {booking.busId}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {booking.status === "CONFIRMED" && (
                <Pressable
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.tint,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.tint,
                      fontWeight: "600",
                    }}
                  >
                    View QR
                  </Text>
                </Pressable>
              )}

              <Pressable>
                <LinearGradient
                  {...getGradientProps(theme.gradients.buttonPrimary)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.gradients.buttonPrimary.text,
                      fontWeight: "600",
                    }}
                  >
                    Details
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  // Filter bookings based on active filter
  const filteredBookings =
    activeFilter === "all" ? bookings : getBookingsByStatus(activeFilter);

  // Get booking count for each status
  const getBookingCount = (status: "all" | Booking["status"]) => {
    if (status === "all") return bookings.length;
    return getBookingsByStatus(status).length;
  };

  return (
    <LinearGradient
      {...getGradientProps(theme.gradients.background)}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
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
                  fontSize: 28,
                  fontWeight: "700",
                  color: theme.gradients.background.text,
                }}
              >
                My Tickets
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.gradients.background.text,
                  opacity: 0.7,
                }}
              >
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}{" "}
                total
              </Text>
            </View>

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
            >
              <Ionicons name="add" size={24} color={theme.tint} />
            </Pressable>
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              {filters.map((filter) => {
                const count = getBookingCount(filter.id);
                return (
                  <Pressable
                    key={filter.id}
                    onPress={() => setActiveFilter(filter.id)}
                    style={{ borderRadius: 20, overflow: "hidden" }}
                  >
                    <LinearGradient
                      {...getGradientProps(
                        activeFilter === filter.id
                          ? theme.gradients.buttonPrimary
                          : {
                              colors: [
                                theme.gradients.card.colors[0],
                                theme.gradients.card.colors[0],
                              ],
                              start: { x: 0, y: 0 },
                              end: { x: 1, y: 0 },
                            }
                      )}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor:
                          activeFilter === filter.id
                            ? "transparent"
                            : theme.gradients.card.border,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color:
                            activeFilter === filter.id
                              ? theme.gradients.buttonPrimary.text
                              : theme.gradients.card.text,
                        }}
                      >
                        {filter.label} ({count})
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Bookings List */}
          <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TicketCard key={booking.id} booking={booking} />
              ))
            ) : (
              <View
                style={{
                  padding: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="ticket-outline"
                  size={48}
                  color={theme.gradients.background.text}
                  style={{ opacity: 0.3, marginBottom: 16 }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.gradients.background.text,
                    opacity: 0.6,
                    textAlign: "center",
                  }}
                >
                  No {activeFilter === "all" ? "" : activeFilter.toLowerCase()}{" "}
                  bookings found
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BookingScreen;
