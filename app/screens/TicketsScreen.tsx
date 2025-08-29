import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const BookingScreen = () => {
  const { theme, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");

  const tickets = [
    {
      id: "1",
      route: "New York → Washington DC",
      date: "Dec 15, 2024",
      time: "09:30 AM",
      seat: "12A",
      price: 65,
      status: "confirmed",
      busNumber: "BUS001",
    },
    {
      id: "2",
      route: "Boston → New York",
      date: "Dec 20, 2024",
      time: "02:15 PM",
      seat: "8B",
      price: 45,
      status: "pending",
      busNumber: "BUS045",
    },
    {
      id: "3",
      route: "Los Angeles → San Francisco",
      date: "Nov 28, 2024",
      time: "11:00 AM",
      seat: "15C",
      price: 75,
      status: "completed",
      busNumber: "BUS123",
    },
  ];

  const filters = [
    { id: "all", label: "All Tickets" },
    { id: "confirmed", label: "Confirmed" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return theme.status.success.colors[0];
      case "pending":
        return theme.status.warning.colors[0];
      case "completed":
        return theme.status.info.colors[0];
      default:
        return theme.gradients.card.text;
    }
  };

  const TicketCard = ({ ticket, theme, getStatusColor }: any) => (
    <Pressable style={{ marginBottom: 16 }}>
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
            }}
          >
            {ticket.route}
          </Text>
          <View
            style={{
              backgroundColor: getStatusColor(ticket.status) + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: getStatusColor(ticket.status),
                textTransform: "uppercase",
              }}
            >
              {ticket.status}
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
                {ticket.date} • {ticket.time}
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
                Bus Number
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {ticket.busNumber}
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
                Seat {ticket.seat} • ${ticket.price}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
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

              <Pressable>
                <LinearGradient
                  colors={theme.gradients.buttonPrimary.colors}
                  start={theme.gradients.buttonPrimary.start}
                  end={theme.gradients.buttonPrimary.end}
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
  const filteredTickets =
    activeFilter === "all"
      ? tickets
      : tickets.filter((ticket) => ticket.status === activeFilter);

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
                Manage your bookings
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
              {filters.map((filter) => (
                <Pressable
                  key={filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                  style={{ borderRadius: 20, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={
                      activeFilter === filter.id
                        ? theme.gradients.buttonPrimary.colors
                        : [
                            theme.gradients.card.colors[0],
                            theme.gradients.card.colors[0],
                          ]
                    }
                    start={theme.gradients.buttonPrimary.start}
                    end={theme.gradients.buttonPrimary.end}
                    locations={theme.gradients.buttonPrimary.locations}
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
                      {filter.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Tickets List */}
          <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                theme={theme}
                getStatusColor={getStatusColor}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BookingScreen;
