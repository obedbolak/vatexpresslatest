// screens/ScheduleScreen.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Alert,
  alertsData,
  bookingsData,
  getImportantAlerts,
  getUnreadAlerts,
  markAlertAsRead,
} from "@/db/busData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  RefreshControl,
  Alert as RNAlert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ScheduleScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "important"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  const getFilteredAlerts = () => {
    switch (activeFilter) {
      case "unread":
        return alerts.filter((alert) => !alert.isRead);
      case "important":
        return alerts.filter((alert) => alert.isImportant);
      default:
        return alerts;
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "reminder":
        return "time-outline";
      case "delay":
        return "warning-outline";
      case "cancellation":
        return "close-circle-outline";
      case "boarding":
        return "log-in-outline";
      case "arrival":
        return "checkmark-circle-outline";
      case "info":
        return "information-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "reminder":
        return theme.status.info.colors[0];
      case "delay":
        return theme.status.warning.colors[0];
      case "cancellation":
        return theme.status.error.colors[0];
      case "boarding":
        return theme.status.success.colors[0];
      case "arrival":
        return theme.status.success.colors[0];
      case "info":
        return theme.tint;
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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleAlertAction = (alert: Alert, actionId: string) => {
    switch (actionId) {
      case "view_ticket":
        const booking = bookingsData.find((b) => b.id === alert.bookingId);
        if (booking) {
          router.push({
            pathname: "/screens/BookingScreen",
            params: { bookingData: JSON.stringify(booking) },
          });
        }
        break;
      case "get_directions":
        RNAlert.alert(
          "Directions",
          "Opening maps with directions to the station..."
        );
        break;
      case "acknowledge":
        handleMarkAsRead(alert.id);
        break;
      case "rate_trip":
        RNAlert.alert("Rate Your Trip", "Thank you for your feedback!");
        break;
      case "explore_route":
        router.push("/");
        break;
      default:
        break;
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
    markAlertAsRead(alertId);
  };

  const handleMarkAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const unreadCount = getUnreadAlerts().length;
  const importantCount = getImportantAlerts().length;

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
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.gradients.card.border,
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
              Schedule & Alerts
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.gradients.background.text,
                opacity: 0.7,
              }}
            >
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          </View>

          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllAsRead}>
              <LinearGradient
                {...getGradientProps(theme.gradients.buttonSecondary)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.gradients.card.border,
                }}
              >
                <Text
                  style={{
                    color: theme.gradients.buttonSecondary.text,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Mark All Read
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {/* Filter Tabs */}

        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 12,
            paddingHorizontal: 20,
          }}
        >
          {[
            { id: "all", label: "All", count: alerts.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "important", label: "Important", count: importantCount },
          ].map((filter) => (
            <Pressable
              key={filter.id}
              onPress={() => setActiveFilter(filter.id as any)}
              style={{ borderRadius: 20, overflow: "hidden" }}
            >
              <LinearGradient
                {...getGradientProps(
                  activeFilter === filter.id
                    ? theme.gradients.buttonPrimary
                    : theme.gradients.card
                )}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor:
                    activeFilter === filter.id
                      ? "transparent"
                      : theme.gradients.card.border,
                  borderRadius: 20,
                  flexDirection: "row",
                  alignItems: "center",
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
                {filter.count > 0 && (
                  <View
                    style={{
                      marginLeft: 8,
                      backgroundColor:
                        activeFilter === filter.id
                          ? "rgba(255,255,255,0.25)"
                          : theme.tint + "20",
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      minWidth: 22,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color:
                          activeFilter === filter.id
                            ? theme.gradients.buttonPrimary.text
                            : theme.tint,
                      }}
                    >
                      {filter.count}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        {/* Alerts List */}
        <ScrollView
          style={{ flex: 1, marginTop: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.tint}
              colors={[theme.tint]}
            />
          }
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 100,
            }}
          >
            {getFilteredAlerts().length > 0 ? (
              getFilteredAlerts().map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  theme={theme}
                  onMarkAsRead={() => handleMarkAsRead(alert.id)}
                  onAction={(actionId) => handleAlertAction(alert, actionId)}
                  getAlertIcon={getAlertIcon}
                  getAlertColor={getAlertColor}
                  formatTime={formatTime}
                  getGradientProps={getGradientProps}
                />
              ))
            ) : (
              <View
                style={{
                  padding: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LinearGradient
                  {...getGradientProps(theme.gradients.card)}
                  style={{
                    padding: 32,
                    borderRadius: 20,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.gradients.card.border,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: theme.gradients.background.colors[0],
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons
                      name="notifications-off-outline"
                      size={40}
                      color={theme.gradients.card.text}
                      style={{ opacity: 0.5 }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: theme.gradients.card.text,
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    No {activeFilter === "all" ? "" : activeFilter} alerts
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: theme.gradients.card.text,
                      opacity: 0.6,
                      textAlign: "center",
                      lineHeight: 20,
                    }}
                  >
                    {activeFilter === "all"
                      ? "All your notifications will appear here"
                      : `No ${activeFilter} notifications at the moment`}
                  </Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Alert Card Component
interface AlertCardProps {
  alert: Alert;
  theme: any;
  onMarkAsRead: () => void;
  onAction: (actionId: string) => void;
  getAlertIcon: (type: Alert["type"]) => any;
  getAlertColor: (type: Alert["type"]) => string;
  formatTime: (date: Date) => string;
  getGradientProps: (gradient: any) => any;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  theme,
  onMarkAsRead,
  onAction,
  getAlertIcon,
  getAlertColor,
  formatTime,
  getGradientProps,
}) => {
  const alertColor = getAlertColor(alert.type);

  return (
    <Pressable
      onPress={() => !alert.isRead && onMarkAsRead()}
      style={{
        marginBottom: 16,
        transform: [{ scale: alert.isRead ? 1 : 1.02 }],
      }}
    >
      <LinearGradient
        {...getGradientProps(theme.gradients.card)}
        style={{
          borderRadius: 16,
          borderWidth: alert.isRead ? 1 : 2,
          borderColor: alert.isRead
            ? theme.gradients.card.border
            : alert.isImportant
            ? alertColor + "40"
            : theme.tint + "30",
          overflow: "hidden",
          shadowColor: alert.isRead ? "transparent" : alertColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: alert.isRead ? 0 : 0.1,
          shadowRadius: 8,
          elevation: alert.isRead ? 1 : 3,
        }}
      >
        {/* Important alert indicator */}
        {!alert.isRead && alert.isImportant && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: alertColor,
            }}
          />
        )}

        {/* Alert Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: alertColor + "15",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              borderWidth: 2,
              borderColor: alertColor + "30",
            }}
          >
            <Ionicons
              name={getAlertIcon(alert.type)}
              size={22}
              color={alertColor}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: theme.gradients.card.text,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {alert.title}
              </Text>
              {!alert.isRead && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.tint,
                    marginLeft: 8,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                fontSize: 12,
                color: theme.gradients.card.text,
                opacity: 0.6,
                marginTop: 2,
                fontWeight: "500",
              }}
            >
              {formatTime(alert.timestamp)}
            </Text>
          </View>
        </View>

        {/* Alert Content */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.gradients.card.text,
              lineHeight: 20,
              marginBottom: 12,
              opacity: 0.9,
            }}
          >
            {alert.message}
          </Text>

          {/* Route Info */}
          {alert.routeInfo && (
            <LinearGradient
              {...getGradientProps(theme.gradients.background)}
              style={{
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.gradients.background.text,
                    }}
                  >
                    {alert.routeInfo.from}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.tint}
                    style={{ marginHorizontal: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.gradients.background.text,
                    }}
                  >
                    {alert.routeInfo.to}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.gradients.background.text}
                  style={{ opacity: 0.6, marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.gradients.background.text,
                    opacity: 0.7,
                    fontWeight: "500",
                  }}
                >
                  {alert.routeInfo.date} • {alert.routeInfo.time}
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Actions */}
          {alert.actions && alert.actions.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {alert.actions.map((action) => (
                <Pressable
                  key={action.id}
                  onPress={() => onAction(action.id)}
                  style={{ borderRadius: 8, overflow: "hidden" }}
                >
                  <LinearGradient
                    {...getGradientProps(
                      action.type === "primary"
                        ? theme.gradients.buttonPrimary
                        : action.type === "danger"
                        ? theme.status.error
                        : theme.gradients.buttonSecondary
                    )}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderWidth: action.type === "secondary" ? 1 : 0,
                      borderColor: theme.gradients.card.border,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color:
                          action.type === "primary"
                            ? theme.gradients.buttonPrimary.text
                            : action.type === "danger"
                            ? theme.status.error.text
                            : theme.gradients.buttonSecondary.text,
                      }}
                    >
                      {action.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

export default ScheduleScreen;
