// components/CustomDatePicker.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  theme: any;
  minimumDate?: Date;
  maximumDate?: Date;
}

const { width: screenWidth } = Dimensions.get("window");

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
  theme,
  minimumDate = new Date(),
  maximumDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
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

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return true;
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
    onClose();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    onDateSelect(today);
    onClose();
  };

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
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
                borderRadius: 20,
                padding: 20,
                width: screenWidth - 40,
                maxWidth: 350,
                borderWidth: 1,
                borderColor: theme.gradients.card.border,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Pressable
                  onPress={() => navigateMonth("prev")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.tint + "20",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.tint} />
                </Pressable>

                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.gradients.card.text,
                    }}
                  >
                    {months[currentMonth]} {currentYear}
                  </Text>
                </View>

                <Pressable
                  onPress={() => navigateMonth("next")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.tint + "20",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.tint}
                  />
                </Pressable>
              </View>

              {/* Week Days Header */}
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 10,
                }}
              >
                {weekDays.map((day) => (
                  <View
                    key={day}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: theme.gradients.card.text,
                        opacity: 0.7,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Grid */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {calendarDays.map((day, index) => (
                  <View
                    key={index}
                    style={{
                      width: `${100 / 7}%`,
                      aspectRatio: 1,
                      padding: 2,
                    }}
                  >
                    {day && (
                      <Pressable
                        onPress={() => handleDateSelect(day)}
                        disabled={isDateDisabled(day)}
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: isDateSelected(day)
                            ? theme.tint
                            : "transparent",
                          opacity: isDateDisabled(day) ? 0.3 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: isDateSelected(day) ? "700" : "500",
                            color: isDateSelected(day)
                              ? "#FFFFFF"
                              : theme.gradients.card.text,
                          }}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={goToToday}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: theme.tint + "20",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.tint,
                    }}
                  >
                    Today
                  </Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={onClose}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: theme.gradients.card.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.gradients.card.text,
                      }}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default CustomDatePicker;
