import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import ViewAllBuses from "./ViewBuses";
export interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  theme: any;
}

export interface Bus {
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

export const todaysBuses: Bus[] = [
  {
    id: "1",
    route: "Yaoundé → Douala",
    departure: "Gare Routière Mvog-Ada",
    arrival: "Gare Routière Bonabéri",
    price: 3500,
    duration: "3h 45m",
    busType: "Express",
    seatsAvailable: 12,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
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
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: "01:00 PM",
    arrivalTime: "03:30 PM",
  },
];
const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = 10;

const Home = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const scrollViewRef = useRef<ScrollView>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ViewAll, setViewAll] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % todaysBuses.length;

        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + CARD_MARGIN * 2),
          animated: true,
        });

        return nextIndex;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_MARGIN * 2));
    setCurrentIndex(index);
  };
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {ViewAll ? (
        <ViewAllBuses setViewAll={setViewAll} />
      ) : (
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
                  fontSize: 16,
                  color: theme.gradients.background.text,
                  opacity: 0.7,
                }}
              >
                Welcome back,
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.gradients.background.text,
                }}
              >
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
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
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={theme.tint}
                />
              </Pressable>
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
                onPress={() => toggleTheme()}
              >
                <Ionicons
                  name={isDark ? "sunny-outline" : "moon-outline"}
                  size={24}
                  color={theme.tint}
                />
              </Pressable>
            </View>
          </View>

          {/* Hero Section - Today's Buses */}
          <View style={{ marginBottom: 30 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 15,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.gradients.background.text,
                  }}
                >
                  Today's Buses
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.gradients.background.text,
                    opacity: 0.6,
                  }}
                >
                  {getTodayDate()}
                </Text>
              </View>

              <Pressable onPress={() => setViewAll(true)}>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.tint,
                    fontWeight: "600",
                  }}
                >
                  View All
                </Text>
              </Pressable>
            </View>

            {/* Auto-scrolling Bus Cards */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              contentContainerStyle={{
                paddingLeft: (screenWidth - CARD_WIDTH) / 2,
                paddingRight: (screenWidth - CARD_WIDTH) / 2,
              }}
              snapToInterval={CARD_WIDTH + CARD_MARGIN * 3}
              decelerationRate="fast"
            >
              {todaysBuses.map((bus, index) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  theme={theme}
                  isActive={index === currentIndex}
                />
              ))}
            </ScrollView>

            {/* Pagination Dots */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 15,
                gap: 8,
              }}
            >
              {todaysBuses.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: index === currentIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentIndex
                        ? theme.tint
                        : theme.gradients.background.text + "30",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.background.text,
                marginBottom: 15,
              }}
            >
              Quick Actions
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <QuickActionCard
                icon="search-outline"
                title="Find Buses"
                subtitle="Search routes"
                theme={theme}
              />
              <QuickActionCard
                icon="ticket-outline"
                title="My Tickets"
                subtitle="View bookings"
                theme={theme}
              />
              <QuickActionCard
                icon="time-outline"
                title="Schedule"
                subtitle="Bus timings"
                theme={theme}
              />
            </View>
          </View>

          {/* Recent Bookings */}
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: 100, // Extra space for bottom tabs
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.gradients.background.text,
                marginBottom: 15,
              }}
            >
              Recent Bookings
            </Text>

            <RecentBookingCard theme={theme} />
            <RecentBookingCard theme={theme} />
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default Home;
const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  subtitle,
  theme,
}) => {
  return (
    <Pressable style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradients.card.colors}
        start={theme.gradients.card.start}
        end={theme.gradients.card.end}
        locations={theme.gradients.card.locations}
        style={{
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.gradients.card.border,
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
            marginBottom: 8,
          }}
        >
          <Ionicons name={icon} size={20} color={theme.tint} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: theme.gradients.card.text,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: theme.gradients.card.text,
            opacity: 0.6,
            textAlign: "center",
          }}
        >
          {subtitle}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

interface RecentBookingCardProps {
  theme: any;
}

const RecentBookingCard: React.FC<RecentBookingCardProps> = ({ theme }) => {
  return (
    <LinearGradient
      colors={theme.gradients.card.colors}
      start={theme.gradients.card.start}
      end={theme.gradients.card.end}
      locations={theme.gradients.card.locations}
      style={{
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.gradients.card.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
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
          New York → Boston
        </Text>
        <View
          style={{
            backgroundColor: theme.status.success.colors[0] + "20",
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: theme.status.success.colors[0],
              fontWeight: "600",
            }}
          >
            CONFIRMED
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
            Dec 15, 2024 • 09:30 AM
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.gradients.card.text,
              opacity: 0.6,
            }}
          >
            Seat 12A • $65
          </Text>
        </View>

        <Pressable>
          <Text
            style={{
              fontSize: 12,
              color: theme.tint,
              fontWeight: "600",
            }}
          >
            View Details
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

interface BusCardProps {
  bus: Bus;
  theme: any;
  isActive: boolean;
}

const BusCard: React.FC<BusCardProps> = ({ bus, theme, isActive }) => {
  const { isDark } = useTheme();
  return (
    <Pressable
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_MARGIN,
        transform: [{ scale: isActive ? 1 : 0.95 }],
        opacity: isActive ? 1 : 0.7,
      }}
    >
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
        {/* Bus Image */}
        <Image
          source={{ uri: bus.image }}
          style={{
            width: "100%",
            height: 120,
            backgroundColor: theme.gradients.card.colors[0],
          }}
          resizeMode="cover"
        />

        {/* Bus Type Badge */}
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: isDark ? theme.gradients.card.border : theme.tint,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {bus.busType}
          </Text>
        </View>

        {/* Card Content */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: theme.gradients.card.text,
              marginBottom: 8,
            }}
          >
            {bus.route}
          </Text>

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
                Departure
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {bus.departureTime}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Ionicons name="arrow-forward" size={16} color={theme.tint} />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {bus.duration}
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
                Arrival
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.gradients.card.text,
                }}
              >
                {bus.arrivalTime}
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
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.tint,
                }}
              >
                {bus.price}CFA
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.gradients.card.text,
                  opacity: 0.6,
                }}
              >
                {bus.seatsAvailable} seats left
              </Text>
            </View>

            <Pressable>
              <LinearGradient
                colors={theme.gradients.buttonPrimary.colors}
                start={theme.gradients.buttonPrimary.start}
                end={theme.gradients.buttonPrimary.end}
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
                    fontSize: 14,
                  }}
                >
                  Book Now
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
};
