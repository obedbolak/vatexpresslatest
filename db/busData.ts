export interface Bus {
  id: string;
  routeCity: string;
  routeDestination: string[];
  departure: {
    location: string;
    seatsTaken: {
      Classic: string[]; // Seats taken for Classic bus type
      VIP: string[]; // Seats taken for VIP bus type
    };
  }[];
  arrival: {
    city: string;
    locations: string[];
  }[];
  price: { CL: number; VIP: number };
  duration: string;
  busType: string[];
  totalSeats: number; // Total seats in the bus (70)
  image: string;
  departureTime: string;
  arrivalTime: string;
}

function getNextDepartureTime(scheduleIndex: number = 0) {
  const now = new Date();

  // Different schedules for different routes
  const schedules = [
    ["09:00 AM", "12:00 PM", "11:00 PM"], // Schedule 0
  ];

  const schedule = schedules[scheduleIndex] || schedules[0];

  // Helper to convert time string to Date object (today or tomorrow)
  function getTimeDate(timeStr: string, baseDate: Date) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Try today's schedule first
  for (let i = 0; i < schedule.length; i++) {
    const busTime = getTimeDate(schedule[i], now);
    if (busTime > now) {
      return schedule[i];
    }
  }

  // If none left today, return the first one tomorrow
  return schedule[0];
}

// Helper function to generate all possible seat numbers for a 70-seat bus
export const generateAllSeatNumbers = (): string[] => {
  const seats: string[] = [];
  for (let row = 1; row <= 14; row++) {
    // Left side: A, B, C
    for (let leftSeat = 0; leftSeat < 3; leftSeat++) {
      const letter = String.fromCharCode(65 + leftSeat);
      seats.push(`${row}${letter}`);
    }
    // Right side: D, E
    for (let rightSeat = 0; rightSeat < 2; rightSeat++) {
      const letter = String.fromCharCode(68 + rightSeat);
      seats.push(`${row}${letter}`);
    }
  }
  return seats;
};

// Helper function to get available seats for a departure location and bus type
export const getAvailableSeats = (
  departureLocation: Bus["departure"][0],
  busType: "Classic" | "VIP"
): number => {
  const totalSeats = 70;
  const takenSeats = departureLocation.seatsTaken[busType]?.length || 0;
  return totalSeats - takenSeats;
};

// Helper function to get seats available for all departure locations
export const getDepartureWithAvailability = (bus: Bus) => {
  return bus.departure.map((dept) => ({
    ...dept,
    availableSeats: {
      Classic: getAvailableSeats(dept, "Classic"),
      VIP: getAvailableSeats(dept, "VIP"),
    },
  }));
};

// Helper function to check if a specific seat is taken
export const isSeatTaken = (
  departureLocation: Bus["departure"][0],
  seatNumber: string,
  busType: "Classic" | "VIP"
): boolean => {
  return departureLocation.seatsTaken[busType]?.includes(seatNumber) || false;
};

// Helper function to book a seat
export const bookSeat = (
  bus: Bus,
  departureLocationName: string,
  seatNumber: string,
  busType: "Classic" | "VIP"
): boolean => {
  const departureLocation = bus.departure.find(
    (dept) => dept.location === departureLocationName
  );
  if (!departureLocation) return false;

  // Check if seat is already taken
  if (isSeatTaken(departureLocation, seatNumber, busType)) {
    return false;
  }

  // Add seat to taken seats
  if (!departureLocation.seatsTaken[busType]) {
    departureLocation.seatsTaken[busType] = [];
  }
  departureLocation.seatsTaken[busType].push(seatNumber);
  return true;
};

// Helper function to cancel a seat booking
export const cancelSeatBooking = (
  bus: Bus,
  departureLocationName: string,
  seatNumber: string,
  busType: "Classic" | "VIP"
): boolean => {
  const departureLocation = bus.departure.find(
    (dept) => dept.location === departureLocationName
  );
  if (!departureLocation) return false;

  const seatIndex = departureLocation.seatsTaken[busType]?.indexOf(seatNumber);
  if (seatIndex !== undefined && seatIndex > -1) {
    departureLocation.seatsTaken[busType].splice(seatIndex, 1);
    return true;
  }
  return false;
};

// creating seets available for the vaious dates

export const baseBuses: Bus[] = [
  {
    id: "1",
    routeCity: "Bamenda",
    routeDestination: ["Douala", "Buea", "Yaoundé"],
    departure: [
      {
        location: "Bamenda Park",

        seatsTaken: {
          Classic: [
            "1A",
            "2A",
            "3B",
            "4C",
            "5A",
            "6B",
            "7C",
            "8A",
            "9B",
            "10A",
          ], // 10 seats taken
          VIP: ["1D", "2E", "3D", "4E", "5D"], // 5 seats taken
        },
      },
      {
        location: "Nkwen Motor Park",
        seatsTaken: {
          Classic: [
            "1A",
            "2B",
            "3C",
            "4A",
            "5B",
            "6C",
            "7A",
            "8B",
            "9C",
            "10A",
            "11B",
            "12C",
          ], // 12 seats taken
          VIP: ["1D", "2E", "3D", "4E", "5D", "6E", "7D", "8E"], // 8 seats taken
        },
      },
      {
        location: "Commercial Avenue",
        seatsTaken: {
          Classic: [
            "1A",
            "2A",
            "3A",
            "4B",
            "5B",
            "6C",
            "7C",
            "8A",
            "9B",
            "10C",
            "11A",
            "12B",
            "13C",
            "14A",
          ], // 14 seats taken
          VIP: ["1D", "2D", "3E", "4E", "5D", "6E"], // 6 seats taken
        },
      },
    ],
    arrival: [
      {
        city: "Douala",
        locations: ["Gare Routière Ndokoti"],
      },
      {
        city: "Buea",
        locations: ["Mile 17 Station"],
      },
      {
        city: "Bamenda",
        locations: ["Bamenda Main Park"],
      },
    ],
    price: { CL: 3500, VIP: 5000 },
    duration: "3h 45m",
    busType: ["Classic", "VIP"],
    totalSeats: 70,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: getNextDepartureTime(0),
    arrivalTime: "10:15 AM",
  },
  {
    id: "2",
    routeCity: "Douala",
    routeDestination: ["Yaoundé", "Buea", "Bamenda"],
    departure: [
      {
        location: "Gare Routière Ndokoti",
        seatsTaken: {
          Classic: ["1A", "2B", "3C", "4A", "5B"], // 5 seats taken
          VIP: ["1D", "2E", "3D"], // 3 seats taken
        },
      },
      {
        location: "Bonabéri Motor Park",
        seatsTaken: {
          Classic: [
            "1A",
            "2A",
            "3B",
            "4C",
            "5A",
            "6B",
            "7C",
            "8A",
            "9B",
            "10C",
          ], // 10 seats taken
          VIP: ["1D", "2E", "3D", "4E", "5D", "6E", "7D"], // 7 seats taken
        },
      },
      {
        location: "Mboppi Park",
        seatsTaken: {
          Classic: [
            "1A",
            "2B",
            "3C",
            "4A",
            "5B",
            "6C",
            "7A",
            "8B",
            "9C",
            "10A",
            "11B",
            "12C",
            "13A",
            "14B",
          ], // 14 seats taken
          VIP: ["1D", "2E", "3D", "4E", "5D", "6E", "7D", "8E", "9D", "10E"], // 10 seats taken
        },
      },
    ],
    arrival: [
      {
        city: "Yaoundé",
        locations: ["Ngoa Ekelle Motor Park"],
      },
      {
        city: "Buea",
        locations: ["Mile 17 Station"],
      },
      {
        city: "Bamenda",
        locations: ["Bamenda Main Park"],
      },
    ],
    price: { CL: 4200, VIP: 6000 },
    duration: "4h 30m",
    busType: ["Classic", "VIP"],
    totalSeats: 70,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    departureTime: getNextDepartureTime(1),
    arrivalTime: "12:30 PM",
  },
  {
    id: "3",
    routeCity: "Yaoundé",
    routeDestination: ["Douala", "Buea", "Bamenda"],
    departure: [
      {
        location: "Ngoa Ekelle Motor Park",
        seatsTaken: {
          Classic: ["1A", "2B"], // 2 seats taken
          VIP: ["1D"], // 1 seat taken
        },
      },
      {
        location: "Mvan Station",
        seatsTaken: {
          Classic: ["1A", "2A", "3B", "4C", "5A", "6B", "7C"], // 7 seats taken
          VIP: ["1D", "2E", "3D", "4E"], // 4 seats taken
        },
      },
      {
        location: "Odza Terminus",
        seatsTaken: {
          Classic: ["1A", "2B", "3C", "4A", "5B"], // 5 seats taken
          VIP: ["1D", "2E", "3D"], // 3 seats taken
        },
      },
    ],
    arrival: [
      {
        city: "Douala",
        locations: ["Gare Routière Ndokoti"],
      },
      {
        city: "Buea",
        locations: ["Mile 17 Station"],
      },
      {
        city: "Bamenda",
        locations: ["Bamenda Main Park"],
      },
    ],
    price: { CL: 5000, VIP: 7000 },
    duration: "6h 15m",
    busType: ["Classic", "VIP"],
    totalSeats: 70,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    departureTime: getNextDepartureTime(2),
    arrivalTime: "03:15 PM",
  },
  {
    id: "4",
    routeCity: "Buea",
    routeDestination: ["Yaoundé", "Bamenda", "Douala"],
    departure: [
      {
        location: "Buea Motor Park",
        seatsTaken: {
          Classic: ["1A", "2B", "3C"], // 3 seats taken
          VIP: ["1D", "2E"], // 2 seats taken
        },
      },
      {
        location: "Mile 17 Station",
        seatsTaken: {
          Classic: ["1A", "2A", "3B", "4C", "5A", "6B"], // 6 seats taken
          VIP: ["1D", "2E", "3D", "4E"], // 4 seats taken
        },
      },
      {
        location: "Molyko Terminus",
        seatsTaken: {
          Classic: [
            "1A",
            "2B",
            "3C",
            "4A",
            "5B",
            "6C",
            "7A",
            "8B",
            "9C",
            "10A",
            "11B",
          ], // 11 seats taken
          VIP: ["1D", "2E", "3D", "4E", "5D", "6E", "7D", "8E"], // 8 seats taken
        },
      },
    ],
    arrival: [
      {
        city: "Yaoundé",
        locations: ["Ngoa Ekelle Motor Park"],
      },
      {
        city: "Bamenda",
        locations: ["Bamenda Main Park"],
      },
      {
        city: "Buea",
        locations: ["Buea Motor Park"],
      },
    ],
    price: { CL: 4200, VIP: 6000 },
    duration: "2h 30m",
    busType: ["Classic", "VIP"],
    totalSeats: 70,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: getNextDepartureTime(3),
    arrivalTime: "03:30 PM",
  },
];

// Enhanced Booking interface to include departure location and bus type
export interface Booking {
  id: string;
  route: {
    origin: string;
    destination: string;
  };
  date: string;
  time: string;
  seat: string;
  price: number;
  currency: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED";
  busId: string;
  departureLocation: string; // Added departure location
  busType: "Classic" | "VIP"; // Added bus type
  passengerName: string;
  bookingReference: string;
}

export const bookingsData: Booking[] = [
  {
    id: "booking_1",
    route: {
      origin: "Yaoundé",
      destination: "Douala",
    },
    date: "Dec 15, 2024",
    time: "09:30 AM",
    seat: "12A",
    price: 3500,
    currency: "CFA",
    status: "CONFIRMED",
    busId: "1",
    departureLocation: "Bamenda Park",
    busType: "Classic",
    passengerName: "John Doe",
    bookingReference: "BK2024001",
  },
  {
    id: "booking_2",
    route: {
      origin: "Douala",
      destination: "Bafoussam",
    },
    date: "Dec 18, 2024",
    time: "08:00 AM",
    seat: "8B",
    price: 4200,
    currency: "CFA",
    status: "PENDING",
    busId: "2",
    departureLocation: "Gare Routière Ndokoti",
    busType: "Classic",
    passengerName: "Jane Smith",
    bookingReference: "BK2024002",
  },
  {
    id: "booking_3",
    route: {
      origin: "Yaoundé",
      destination: "Bamenda",
    },
    date: "Dec 20, 2024",
    time: "09:00 AM",
    seat: "15C",
    price: 6500,
    currency: "CFA",
    status: "CONFIRMED",
    busId: "3",
    departureLocation: "Ngoa Ekelle Motor Park",
    busType: "VIP",
    passengerName: "Mike Johnson",
    bookingReference: "BK2024003",
  },
  {
    id: "booking_4",
    route: {
      origin: "Douala",
      destination: "Buéa",
    },
    date: "Dec 22, 2024",
    time: "01:00 PM",
    seat: "5A",
    price: 2500,
    currency: "CFA",
    status: "COMPLETED",
    busId: "4",
    departureLocation: "Mile 17 Station",
    busType: "Classic",
    passengerName: "Sarah Wilson",
    bookingReference: "BK2024004",
  },
  {
    id: "booking_5",
    route: {
      origin: "Bafoussam",
      destination: "Garoua",
    },
    date: "Dec 25, 2024",
    time: "10:00 PM",
    seat: "3D",
    price: 8500,
    currency: "CFA",
    status: "CANCELLED",
    busId: "5",
    departureLocation: "Buea Motor Park",
    busType: "VIP",
    passengerName: "Robert Brown",
    bookingReference: "BK2024005",
  },
];

// Helper functions
export const getBookingsByStatus = (status: Booking["status"]) => {
  return bookingsData.filter((booking) => booking.status === status);
};

export const getBookingById = (id: string) => {
  return bookingsData.find((booking) => booking.id === id);
};

export const getRecentBookings = (limit: number = 5) => {
  return bookingsData.slice(0, limit);
};

// Enhanced helper functions for seat management
export const getTotalSeatsAvailable = (bus: Bus): number => {
  const allDepartures = getDepartureWithAvailability(bus);
  return allDepartures.reduce((total, dept) => {
    return total + dept.availableSeats.Classic + dept.availableSeats.VIP;
  }, 0);
};

export const getBestDepartureLocation = (
  bus: Bus,
  busType: "Classic" | "VIP"
) => {
  const departures = getDepartureWithAvailability(bus);
  return departures.reduce((best, current) => {
    const currentSeats = current.availableSeats[busType];
    const bestSeats = best.availableSeats[busType];
    return currentSeats > bestSeats ? current : best;
  });
};

export const getSeatsFromLocation = (
  bus: Bus,
  locationName: string,
  busType: "Classic" | "VIP"
): number => {
  const departures = getDepartureWithAvailability(bus);
  const location = departures.find((dept) => dept.location === locationName);
  return location ? location.availableSeats[busType] : 0;
};

// Function to simulate real-time seat booking (for demonstration)
export const simulateRealTimeBooking = (busId: string) => {
  const bus = baseBuses.find((b) => b.id === busId);
  if (!bus) return;

  // Randomly book some seats to simulate real-time changes
  const randomDeparture =
    bus.departure[Math.floor(Math.random() * bus.departure.length)];
  const busTypes: ("Classic" | "VIP")[] = ["Classic", "VIP"];
  const randomBusType = busTypes[Math.floor(Math.random() * busTypes.length)];

  const allSeats = generateAllSeatNumbers();
  const availableSeats = allSeats.filter(
    (seat) => !isSeatTaken(randomDeparture, seat, randomBusType)
  );

  if (availableSeats.length > 0) {
    const randomSeat =
      availableSeats[Math.floor(Math.random() * availableSeats.length)];
    bookSeat(bus, randomDeparture.location, randomSeat, randomBusType);
    console.log(
      `Seat ${randomSeat} booked at ${randomDeparture.location} for ${randomBusType}`
    );
  }
};

// Rest of your alert data remains the same...
export interface Alert {
  id: string;
  type: "reminder" | "delay" | "cancellation" | "boarding" | "arrival" | "info";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  busId?: string;
  bookingId?: string;
  routeInfo?: {
    from: string;
    to: string;
    time: string;
    date: string;
  };
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: string;
}

export const alertsData: Alert[] = [
  // Your existing alert data...
  {
    id: "alert_1",
    type: "reminder",
    title: "Departure Reminder",
    message:
      "Your bus to Douala departs in 2 hours. Please arrive at the station 30 minutes early.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    isImportant: true,
    busId: "1",
    bookingId: "booking_1",
    routeInfo: {
      from: "Yaoundé",
      to: "Douala",
      time: "09:30 AM",
      date: "Dec 15, 2024",
    },
    actions: [
      {
        id: "view_ticket",
        label: "View Ticket",
        type: "primary",
        action: "view_ticket",
      },
      {
        id: "get_directions",
        label: "Get Directions",
        type: "secondary",
        action: "get_directions",
      },
    ],
  },
  {
    id: "alert_2",
    type: "delay",
    title: "Schedule Update",
    message:
      "Your bus from Douala to Bafoussam has been delayed by 45 minutes due to traffic.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    isRead: false,
    isImportant: true,
    busId: "2",
    bookingId: "booking_2",
    routeInfo: {
      from: "Douala",
      to: "Bafoussam",
      time: "08:45 AM", // Updated time
      date: "Dec 18, 2024",
    },
    actions: [
      {
        id: "acknowledge",
        label: "Got it",
        type: "primary",
        action: "acknowledge",
      },
    ],
  },
  {
    id: "alert_3",
    type: "boarding",
    title: "Boarding Now",
    message:
      "Boarding has started for your bus to Bamenda. Please proceed to platform B.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isRead: true,
    isImportant: true,
    busId: "3",
    bookingId: "booking_3",
    routeInfo: {
      from: "Yaoundé",
      to: "Bamenda",
      time: "09:00 AM",
      date: "Dec 20, 2024",
    },
  },
  {
    id: "alert_4",
    type: "arrival",
    title: "Arrival Update",
    message:
      "You have successfully arrived in Buéa. Thank you for choosing our service!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    isImportant: false,
    busId: "4",
    bookingId: "booking_4",
    routeInfo: {
      from: "Douala",
      to: "Buéa",
      time: "01:00 PM",
      date: "Dec 22, 2024",
    },
    actions: [
      {
        id: "rate_trip",
        label: "Rate Trip",
        type: "secondary",
        action: "rate_trip",
      },
    ],
  },
  {
    id: "alert_5",
    type: "info",
    title: "New Route Available",
    message:
      "We now offer direct service from Yaoundé to Kribi. Book your tickets now!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: false,
    isImportant: false,
    actions: [
      {
        id: "explore",
        label: "Explore Route",
        type: "primary",
        action: "explore_route",
      },
    ],
  },
];

// Helper functions for alerts remain the same
export const getUnreadAlerts = () => {
  return alertsData.filter((alert) => !alert.isRead);
};

export const getImportantAlerts = () => {
  return alertsData.filter((alert) => alert.isImportant && !alert.isRead);
};

export const getAlertsByType = (type: Alert["type"]) => {
  return alertsData.filter((alert) => alert.type === type);
};

export const markAlertAsRead = (alertId: string) => {
  const alert = alertsData.find((a) => a.id === alertId);
  if (alert) {
    alert.isRead = true;
  }
};
