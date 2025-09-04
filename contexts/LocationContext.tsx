// LocationContext.tsx
import * as Location from "expo-location";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Types
interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface LocationData {
  coords: LocationCoords;
  timestamp: number;
}

interface AddressData {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
}

interface LocationContextType {
  location: LocationData | null;
  address: AddressData | null;
  loading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
  locationServicesEnabled: boolean | null;
  getCurrentLocation: () => Promise<LocationData | null>;
  reverseGeocode: (coords: LocationCoords) => Promise<AddressData | null>;
  requestLocationPermission: () => Promise<boolean>;
  clearError: () => void;
  watchLocation: () => Promise<void>;
  stopWatchingLocation: () => void;
}

interface LocationProviderProps {
  children: ReactNode;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState<
    boolean | null
  >(null);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);

  // Check if location services are enabled
  const checkLocationServices = async (): Promise<boolean> => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      setLocationServicesEnabled(enabled);
      if (!enabled) {
        setError(
          "Location services are disabled. Please enable them in device settings."
        );
      }
      return enabled;
    } catch (err) {
      setError("Failed to check location services");
      return false;
    }
  };

  // Request location permissions
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // First check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        return false;
      }

      // Check current permission status
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();

      if (currentStatus === Location.PermissionStatus.GRANTED) {
        setPermissionStatus(currentStatus);
        return true;
      }

      if (currentStatus === Location.PermissionStatus.DENIED) {
        setError(
          "Location permission was denied. Please enable it in device settings."
        );
        setPermissionStatus(currentStatus);
        return false;
      }

      // Request permission if not determined yet
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setError("Location permission is required to access your location.");
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to request location permission";
      setError(errorMessage);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      // Optional: Check if we have a recent location (within 1 minute) for manual caching
      const now = Date.now();
      if (location && now - location.timestamp < 60000) {
        setLoading(false);
        return location;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        coords: currentLocation.coords,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);

      // Get reverse geocoding
      await reverseGeocode(currentLocation.coords);

      setLoading(false);
      return locationData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get location";
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (
    coords: LocationCoords
  ): Promise<AddressData | null> => {
    try {
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (reverseGeocodedAddress && reverseGeocodedAddress.length > 0) {
        const addressInfo = reverseGeocodedAddress[0];

        const addressData: AddressData = {
          street: addressInfo.street || undefined,
          city: addressInfo.city || undefined,
          region: addressInfo.region || undefined,
          postalCode: addressInfo.postalCode || undefined,
          country: addressInfo.country || undefined,
          formattedAddress: [
            addressInfo.street,
            addressInfo.city,
            addressInfo.region,
            addressInfo.postalCode,
            addressInfo.country,
          ]
            .filter(Boolean)
            .join(", "),
        };

        setAddress(addressData);
        return addressData;
      }
      return null;
    } catch (err) {
      console.warn("Reverse geocoding failed:", err);
      return null;
    }
  };

  // Watch location changes
  const watchLocation = async (): Promise<void> => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Update every 100 meters
        },
        (newLocation) => {
          const locationData: LocationData = {
            coords: newLocation.coords,
            timestamp: newLocation.timestamp,
          };
          setLocation(locationData);
          reverseGeocode(newLocation.coords);
        }
      );
      setLocationSubscription(subscription);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to watch location";
      setError(errorMessage);
    }
  };

  // Stop watching location
  const stopWatchingLocation = (): void => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Check permissions and location services on mount
  useEffect(() => {
    const initializeLocationServices = async () => {
      await checkLocationServices();
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
    };

    initializeLocationServices();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const value: LocationContextType = {
    location,
    address,
    loading,
    error,
    permissionStatus,
    locationServicesEnabled,
    getCurrentLocation,
    reverseGeocode,
    requestLocationPermission,
    clearError,
    watchLocation,
    stopWatchingLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
