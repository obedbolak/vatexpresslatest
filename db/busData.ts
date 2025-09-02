export interface Bus {
  id: string;
  routeCity: string;
  routeDestination: string;
  departure: string[];
  arrival: string;
  price: number;
  duration: string;
  busType: string;
  seatsAvailable: number;
  image: string;
  departureTime: string;
  arrivalTime: string;
}

export const baseBuses: Bus[] = [
  {
    id: "1",
    routeCity: "Yaoundé",
    routeDestination: "Douala",
    departure: ["Mvog-Ada", "Biyem-Assi", "Olembe"],
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
    routeCity: "Douala",
    routeDestination: "Bafoussam",
    departure: ["Bonabéri", "Makepe", "Akwa"],
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
    routeCity: "Yaoundé",
    routeDestination: "Bamenda",
    departure: ["Mvog-Ada", "Mvan", "Nkomo"],
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
    routeCity: "Douala",
    routeDestination: "Buéa",
    departure: ["Bonabéri", "Deido", "Bonanjo"],
    arrival: "Buea Motor Park",
    price: 2500,
    duration: "2h 30m",
    busType: "Express",
    seatsAvailable: 20,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: "01:00 PM",
    arrivalTime: "03:30 PM",
  },
  {
    id: "5",
    routeCity: "Bafoussam",
    routeDestination: "Garoua",
    departure: ["Centre-ville", "Tamdja", "Djeleng"],
    arrival: "Gare Routière de Garoua",
    price: 8500,
    duration: "8h 00m",
    busType: "VIP",
    seatsAvailable: 6,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    departureTime: "10:00 PM",
    arrivalTime: "06:00 AM",
  },
  {
    id: "6",
    routeCity: "Yaoundé",
    routeDestination: "Bertoua",
    departure: ["Mvog-Ada", "Mokolo", "Mfoundi"],
    arrival: "Gare Routière Bertoua",
    price: 5500,
    duration: "5h 30m",
    busType: "Standard",
    seatsAvailable: 18,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: "07:30 AM",
    arrivalTime: "01:00 PM",
  },
  {
    id: "7",
    routeCity: "Douala",
    routeDestination: "Kribi",
    departure: ["Bonabéri", "Bessengue", "Logbaba"],
    arrival: "Kribi Beach Motor Park",
    price: 3000,
    duration: "3h 00m",
    busType: "Express",
    seatsAvailable: 14,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    departureTime: "02:00 PM",
    arrivalTime: "05:00 PM",
  },
  {
    id: "8",
    routeCity: "Bamenda",
    routeDestination: "Kumba",
    departure: ["Commercial Avenue", "Foncha Street", "Up Station"],
    arrival: "Kumba Motor Park",
    price: 4500,
    duration: "4h 45m",
    busType: "Luxury",
    seatsAvailable: 10,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    departureTime: "11:00 AM",
    arrivalTime: "03:45 PM",
  },
];

// data/bookingData.ts
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
// data/alertData.ts
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

// Helper functions
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
