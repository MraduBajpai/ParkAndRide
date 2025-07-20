/**
 * Utility functions for map and location-based operations
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ParkingLocation extends Location {
  id: number;
  name: string;
  availableSpots: number;
  totalSpots: number;
  hourlyRate: number;
}

/**
 * Calculate the distance between two geographical points using the Haversine formula
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using the browser's geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Sort parking locations by distance from a given point
 */
export function sortLocationsByDistance(
  locations: ParkingLocation[],
  userLocation: Location
): ParkingLocation[] {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(userLocation, location),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Find parking locations within a specified radius (in kilometers)
 */
export function findLocationsWithinRadius(
  locations: ParkingLocation[],
  center: Location,
  radiusKm: number
): ParkingLocation[] {
  return locations.filter(location => {
    const distance = calculateDistance(center, location);
    return distance <= radiusKm;
  });
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Generate a Google Maps URL for navigation
 */
export function generateNavigationUrl(
  destination: Location,
  origin?: Location
): string {
  const baseUrl = "https://www.google.com/maps/dir/";
  
  if (origin) {
    return `${baseUrl}${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}`;
  }
  
  return `${baseUrl}/${destination.latitude},${destination.longitude}`;
}

/**
 * Parse location string (e.g., "12.9716, 77.5946") into Location object
 */
export function parseLocationString(locationStr: string): Location | null {
  const parts = locationStr.split(',').map(part => part.trim());
  
  if (parts.length !== 2) {
    return null;
  }
  
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }
  
  // Basic validation for reasonable coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  
  return { latitude, longitude };
}

/**
 * Create bounds for a map view that includes all given locations
 */
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function createBounds(locations: Location[]): Bounds | null {
  if (locations.length === 0) {
    return null;
  }
  
  let north = locations[0].latitude;
  let south = locations[0].latitude;
  let east = locations[0].longitude;
  let west = locations[0].longitude;
  
  for (const location of locations) {
    north = Math.max(north, location.latitude);
    south = Math.min(south, location.latitude);
    east = Math.max(east, location.longitude);
    west = Math.min(west, location.longitude);
  }
  
  // Add some padding
  const latPadding = (north - south) * 0.1 || 0.01;
  const lngPadding = (east - west) * 0.1 || 0.01;
  
  return {
    north: north + latPadding,
    south: south - latPadding,
    east: east + lngPadding,
    west: west - lngPadding,
  };
}

/**
 * Check if a location is within a certain bounds
 */
export function isLocationInBounds(location: Location, bounds: Bounds): boolean {
  return (
    location.latitude >= bounds.south &&
    location.latitude <= bounds.north &&
    location.longitude >= bounds.west &&
    location.longitude <= bounds.east
  );
}

/**
 * Mock locations for demonstration (Indian metro stations)
 */
export const mockMetroStations: ParkingLocation[] = [
  {
    id: 1,
    name: "Metro Central Station",
    latitude: 12.9716,
    longitude: 77.5946,
    availableSpots: 154,
    totalSpots: 456,
    hourlyRate: 25,
  },
  {
    id: 2,
    name: "East Plaza Hub",
    latitude: 12.9698,
    longitude: 77.7499,
    availableSpots: 38,
    totalSpots: 342,
    hourlyRate: 35,
  },
  {
    id: 3,
    name: "West Junction Terminal",
    latitude: 12.9915,
    longitude: 77.5556,
    availableSpots: 234,
    totalSpots: 678,
    hourlyRate: 20,
  },
];
