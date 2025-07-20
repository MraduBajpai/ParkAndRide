import { 
  users, 
  parkingStations,
  parkingSpots,
  parkingBookings,
  rideBookings,
  publicTransportSchedules,
  ridePreferences,
  systemAlerts,
  type User, 
  type InsertUser,
  type ParkingStation,
  type InsertParkingStation,
  type ParkingSpot,
  type InsertParkingSpot,
  type ParkingBooking,
  type InsertParkingBooking,
  type RideBooking,
  type InsertRideBooking,
  type PublicTransportSchedule,
  type InsertPublicTransportSchedule,
  type RidePreference,
  type InsertRidePreference,
  type SystemAlert,
  type InsertSystemAlert
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Parking station methods
  getParkingStations(): Promise<ParkingStation[]>;
  getParkingStation(id: number): Promise<ParkingStation | undefined>;
  searchParkingStations(query: string, lat?: number, lng?: number): Promise<ParkingStation[]>;
  createParkingStation(station: InsertParkingStation): Promise<ParkingStation>;
  updateParkingStation(id: number, updates: Partial<ParkingStation>): Promise<ParkingStation | undefined>;
  
  // Parking spot methods
  getParkingSpotsByStation(stationId: number): Promise<ParkingSpot[]>;
  getParkingSpot(id: number): Promise<ParkingSpot | undefined>;
  updateParkingSpot(id: number, updates: Partial<ParkingSpot>): Promise<ParkingSpot | undefined>;
  
  // Parking booking methods
  getParkingBookingsByUser(userId: number): Promise<ParkingBooking[]>;
  getParkingBooking(id: number): Promise<ParkingBooking | undefined>;
  createParkingBooking(booking: InsertParkingBooking): Promise<ParkingBooking>;
  updateParkingBooking(id: number, updates: Partial<ParkingBooking>): Promise<ParkingBooking | undefined>;
  
  // Ride booking methods
  getRideBookingsByUser(userId: number): Promise<RideBooking[]>;
  getActiveRideBookings(userId: number): Promise<RideBooking[]>;
  createRideBooking(booking: InsertRideBooking): Promise<RideBooking>;
  updateRideBooking(id: number, updates: Partial<RideBooking>): Promise<RideBooking | undefined>;
  findPoolingRides(pickupLocation: string, destination: string, scheduledTime: Date): Promise<RideBooking[]>;
  
  // Public transport schedule methods
  getPublicTransportSchedules(from?: string, to?: string): Promise<PublicTransportSchedule[]>;
  createPublicTransportSchedule(schedule: InsertPublicTransportSchedule): Promise<PublicTransportSchedule>;
  updatePublicTransportSchedule(id: number, updates: Partial<PublicTransportSchedule>): Promise<PublicTransportSchedule | undefined>;
  
  // Ride preference methods
  getUserRidePreference(userId: number): Promise<RidePreference | undefined>;
  createRidePreference(preference: InsertRidePreference): Promise<RidePreference>;
  updateRidePreference(userId: number, updates: Partial<RidePreference>): Promise<RidePreference | undefined>;
  
  // System alert methods
  getSystemAlerts(): Promise<SystemAlert[]>;
  createSystemAlert(alert: InsertSystemAlert): Promise<SystemAlert>;
  updateSystemAlert(id: number, updates: Partial<SystemAlert>): Promise<SystemAlert | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parkingStations: Map<number, ParkingStation>;
  private parkingSpots: Map<number, ParkingSpot>;
  private parkingBookings: Map<number, ParkingBooking>;
  private rideBookings: Map<number, RideBooking>;
  private publicTransportSchedules: Map<number, PublicTransportSchedule>;
  private ridePreferences: Map<number, RidePreference>;
  private systemAlerts: Map<number, SystemAlert>;
  
  private currentUserId: number = 1;
  private currentStationId: number = 1;
  private currentSpotId: number = 1;
  private currentBookingId: number = 1;
  private currentRideId: number = 1;
  private currentScheduleId: number = 1;
  private currentPreferenceId: number = 1;
  private currentAlertId: number = 1;

  constructor() {
    this.users = new Map();
    this.parkingStations = new Map();
    this.parkingSpots = new Map();
    this.parkingBookings = new Map();
    this.rideBookings = new Map();
    this.publicTransportSchedules = new Map();
    this.ridePreferences = new Map();
    this.systemAlerts = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize sample user
    const sampleUser: User = {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      password: "hashed_password",
      firstName: "John",
      lastName: "Doe",
      phone: "+91 9876543210",
      rewardPoints: 1250,
      membershipLevel: "silver",
      createdAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Initialize parking stations
    const stations = [
      {
        id: 1,
        name: "Metro Central Station",
        address: "MG Road, Central Metro Station, Bengaluru",
        latitude: "12.9716",
        longitude: "77.5946",
        totalSpots: 456,
        availableSpots: 154,
        hourlyRate: "25.00",
        amenities: ["covered", "ev_charging", "security", "24_hour"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "East Plaza Hub",
        address: "Whitefield Main Road, East Metro Station, Bengaluru",
        latitude: "12.9698",
        longitude: "77.7499",
        totalSpots: 342,
        availableSpots: 38,
        hourlyRate: "35.00",
        amenities: ["covered", "bike_parking", "security"],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "West Junction Terminal",
        address: "Rajajinagar Metro Station, West Bengaluru",
        latitude: "12.9915",
        longitude: "77.5556",
        totalSpots: 678,
        availableSpots: 234,
        hourlyRate: "20.00",
        amenities: ["multi_level", "covered", "ev_charging", "security"],
        isActive: true,
        createdAt: new Date(),
      }
    ];

    stations.forEach(station => {
      this.parkingStations.set(station.id, station as ParkingStation);
    });
    this.currentStationId = 4;

    // Initialize some parking spots for each station
    const spots = [
      // Metro Central Station spots
      { stationId: 1, spotNumber: "A-01", level: "Ground", section: "A", spotType: "standard" },
      { stationId: 1, spotNumber: "A-02", level: "Ground", section: "A", spotType: "ev_charging" },
      { stationId: 1, spotNumber: "B-24", level: "Level 2", section: "B", spotType: "standard" },
      { stationId: 1, spotNumber: "B-25", level: "Level 2", section: "B", spotType: "standard" },
      
      // East Plaza Hub spots  
      { stationId: 2, spotNumber: "A-12", level: "Ground", section: "A", spotType: "compact" },
      { stationId: 2, spotNumber: "B-15", level: "Level 1", section: "B", spotType: "standard" },
      
      // West Junction Terminal spots
      { stationId: 3, spotNumber: "G-10", level: "Ground", section: "G", spotType: "disabled" },
      { stationId: 3, spotNumber: "H-05", level: "Level 1", section: "H", spotType: "ev_charging" },
    ];

    spots.forEach((spot, index) => {
      const parkingSpot: ParkingSpot = {
        id: index + 1,
        stationId: spot.stationId,
        spotNumber: spot.spotNumber,
        level: spot.level,
        section: spot.section,
        spotType: spot.spotType,
        isOccupied: false,
        isReserved: false,
        lastUpdated: new Date(),
      };
      this.parkingSpots.set(index + 1, parkingSpot);
    });
    this.currentSpotId = spots.length + 1;

    // Initialize system alerts
    const alerts = [
      {
        id: 1,
        type: "sensor_malfunction",
        severity: "high",
        title: "Sensor malfunction",
        description: "East Plaza Hub - Zone E, Spots 45-52",
        stationId: 2,
        isResolved: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: 2,
        type: "high_demand",
        severity: "medium",
        title: "High demand detected",
        description: "Metro Central - Dynamic pricing activated",
        stationId: 1,
        isResolved: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: 3,
        type: "maintenance",
        severity: "low",
        title: "Maintenance scheduled",
        description: "West Junction - Zone H, Tomorrow 2AM",
        stationId: 3,
        isResolved: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      }
    ];

    alerts.forEach(alert => {
      const systemAlert: SystemAlert = {
        ...alert,
        resolvedAt: null,
      };
      this.systemAlerts.set(alert.id, systemAlert);
    });
    this.currentAlertId = 4;

    // Initialize public transport schedules
    const schedules = [
      {
        id: 1,
        transportType: "metro",
        routeName: "Blue Line",
        routeNumber: "BL-01",
        fromStation: "Central Metro Station",
        toStation: "East Plaza Hub",
        departureTime: "06:00",
        arrivalTime: "06:25",
        frequency: 5,
        operatingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        fare: "35.00",
        isActive: true,
        lastUpdated: new Date(),
      },
      {
        id: 2,
        transportType: "bus",
        routeName: "City Connect",
        routeNumber: "CC-42",
        fromStation: "Metro Central Station",
        toStation: "Tech Park Phase 1",
        departureTime: "06:15",
        arrivalTime: "06:45",
        frequency: 15,
        operatingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        fare: "25.00",
        isActive: true,
        lastUpdated: new Date(),
      }
    ];

    schedules.forEach(schedule => {
      const transportSchedule: PublicTransportSchedule = {
        ...schedule,
        routeNumber: schedule.routeNumber || null,
        operatingDays: schedule.operatingDays || null,
        isActive: schedule.isActive !== undefined ? schedule.isActive : null,
        lastUpdated: schedule.lastUpdated || null,
      };
      this.publicTransportSchedules.set(schedule.id, transportSchedule);
    });
    this.currentScheduleId = 3;

    // Initialize sample ride preference for user 1
    const samplePreference: RidePreference = {
      id: 1,
      userId: 1,
      preferredRideType: "shared",
      maxWaitTime: 8,
      poolingPreference: true,
      acPreference: true,
      musicPreference: false,
      preferredPaymentMethod: "wallet",
      frequentDestinations: ["Tech Park Phase 1", "Mall of Bangalore", "Airport"],
      commutePattern: {
        morningDestination: "Tech Park Phase 1",
        eveningDestination: "Metro Central Station",
        preferredTime: "09:00",
        averageRides: 12
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.ridePreferences.set(1, samplePreference);
    this.currentPreferenceId = 2;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      phone: insertUser.phone || null,
      rewardPoints: insertUser.rewardPoints || null,
      membershipLevel: insertUser.membershipLevel || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Parking station methods
  async getParkingStations(): Promise<ParkingStation[]> {
    return Array.from(this.parkingStations.values()).filter(station => station.isActive);
  }

  async getParkingStation(id: number): Promise<ParkingStation | undefined> {
    return this.parkingStations.get(id);
  }

  async searchParkingStations(query: string, lat?: number, lng?: number): Promise<ParkingStation[]> {
    const stations = Array.from(this.parkingStations.values()).filter(station => station.isActive);
    
    if (!query && !lat && !lng) {
      return stations;
    }

    let filtered = stations;

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(station => 
        station.name.toLowerCase().includes(lowerQuery) ||
        station.address.toLowerCase().includes(lowerQuery)
      );
    }

    // Simple distance-based filtering (in a real app, you'd use proper geospatial queries)
    if (lat && lng) {
      filtered = filtered.sort((a, b) => {
        const distanceA = Math.sqrt(
          Math.pow(parseFloat(a.latitude) - lat, 2) + 
          Math.pow(parseFloat(a.longitude) - lng, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(parseFloat(b.latitude) - lat, 2) + 
          Math.pow(parseFloat(b.longitude) - lng, 2)
        );
        return distanceA - distanceB;
      });
    }

    return filtered;
  }

  async createParkingStation(insertStation: InsertParkingStation): Promise<ParkingStation> {
    const id = this.currentStationId++;
    const station: ParkingStation = {
      ...insertStation,
      id,
      amenities: insertStation.amenities || null,
      isActive: insertStation.isActive !== undefined ? insertStation.isActive : null,
      createdAt: new Date(),
    };
    this.parkingStations.set(id, station);
    return station;
  }

  async updateParkingStation(id: number, updates: Partial<ParkingStation>): Promise<ParkingStation | undefined> {
    const station = this.parkingStations.get(id);
    if (!station) return undefined;

    const updatedStation = { ...station, ...updates };
    this.parkingStations.set(id, updatedStation);
    return updatedStation;
  }

  // Parking spot methods
  async getParkingSpotsByStation(stationId: number): Promise<ParkingSpot[]> {
    return Array.from(this.parkingSpots.values()).filter(spot => spot.stationId === stationId);
  }

  async getParkingSpot(id: number): Promise<ParkingSpot | undefined> {
    return this.parkingSpots.get(id);
  }

  async updateParkingSpot(id: number, updates: Partial<ParkingSpot>): Promise<ParkingSpot | undefined> {
    const spot = this.parkingSpots.get(id);
    if (!spot) return undefined;

    const updatedSpot = { ...spot, ...updates, lastUpdated: new Date() };
    this.parkingSpots.set(id, updatedSpot);
    return updatedSpot;
  }

  // Parking booking methods
  async getParkingBookingsByUser(userId: number): Promise<ParkingBooking[]> {
    return Array.from(this.parkingBookings.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getParkingBooking(id: number): Promise<ParkingBooking | undefined> {
    return this.parkingBookings.get(id);
  }

  async createParkingBooking(insertBooking: InsertParkingBooking): Promise<ParkingBooking> {
    const id = this.currentBookingId++;
    const qrCode = `PKG${id.toString().padStart(9, '0')}`;
    
    const booking: ParkingBooking = {
      ...insertBooking,
      id,
      qrCode,
      spotId: insertBooking.spotId || null,
      paymentStatus: insertBooking.paymentStatus || null,
      checkInTime: null,
      checkOutTime: null,
      createdAt: new Date(),
    };
    
    this.parkingBookings.set(id, booking);
    
    // Update station availability
    if (booking.stationId) {
      const station = this.parkingStations.get(booking.stationId);
      if (station && station.availableSpots > 0) {
        const updatedStation = { ...station, availableSpots: station.availableSpots - 1 };
        this.parkingStations.set(booking.stationId, updatedStation);
      }
    }
    
    return booking;
  }

  async updateParkingBooking(id: number, updates: Partial<ParkingBooking>): Promise<ParkingBooking | undefined> {
    const booking = this.parkingBookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...updates };
    this.parkingBookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Ride booking methods
  async getRideBookingsByUser(userId: number): Promise<RideBooking[]> {
    return Array.from(this.rideBookings.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getActiveRideBookings(userId: number): Promise<RideBooking[]> {
    return Array.from(this.rideBookings.values())
      .filter(booking => booking.userId === userId && 
        ['pending', 'confirmed', 'driver_assigned', 'in_progress'].includes(booking.status))
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async findPoolingRides(pickupLocation: string, destination: string, scheduledTime: Date): Promise<RideBooking[]> {
    return Array.from(this.rideBookings.values())
      .filter(booking => 
        booking.poolingEnabled &&
        booking.status === 'pending' &&
        booking.pickupLocation.toLowerCase().includes(pickupLocation.toLowerCase()) &&
        booking.destination.toLowerCase().includes(destination.toLowerCase()) &&
        booking.scheduledTime &&
        Math.abs(booking.scheduledTime.getTime() - scheduledTime.getTime()) < 30 * 60 * 1000 // within 30 minutes
      );
  }

  async createRideBooking(insertBooking: InsertRideBooking): Promise<RideBooking> {
    const id = this.currentRideId++;
    const booking: RideBooking = {
      ...insertBooking,
      id,
      parkingBookingId: insertBooking.parkingBookingId || null,
      scheduledTime: insertBooking.scheduledTime || null,
      driverInfo: insertBooking.driverInfo || null,
      routeInfo: insertBooking.routeInfo || null,
      poolingEnabled: insertBooking.poolingEnabled || null,
      pooledWithRides: insertBooking.pooledWithRides || null,
      maxWaitTime: insertBooking.maxWaitTime || null,
      estimatedArrival: insertBooking.estimatedArrival || null,
      actualArrival: insertBooking.actualArrival || null,
      trackingEnabled: insertBooking.trackingEnabled !== undefined ? insertBooking.trackingEnabled : null,
      actualCost: null,
      createdAt: new Date(),
    };
    this.rideBookings.set(id, booking);
    return booking;
  }

  async updateRideBooking(id: number, updates: Partial<RideBooking>): Promise<RideBooking | undefined> {
    const booking = this.rideBookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...updates };
    this.rideBookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Public transport schedule methods
  async getPublicTransportSchedules(from?: string, to?: string): Promise<PublicTransportSchedule[]> {
    let schedules = Array.from(this.publicTransportSchedules.values()).filter(s => s.isActive);
    
    if (from) {
      schedules = schedules.filter(s => s.fromStation.toLowerCase().includes(from.toLowerCase()));
    }
    if (to) {
      schedules = schedules.filter(s => s.toStation.toLowerCase().includes(to.toLowerCase()));
    }
    
    return schedules;
  }

  async createPublicTransportSchedule(insertSchedule: InsertPublicTransportSchedule): Promise<PublicTransportSchedule> {
    const id = this.currentScheduleId++;
    const schedule: PublicTransportSchedule = {
      ...insertSchedule,
      id,
      lastUpdated: new Date(),
    };
    this.publicTransportSchedules.set(id, schedule);
    return schedule;
  }

  async updatePublicTransportSchedule(id: number, updates: Partial<PublicTransportSchedule>): Promise<PublicTransportSchedule | undefined> {
    const schedule = this.publicTransportSchedules.get(id);
    if (!schedule) return undefined;

    const updatedSchedule = { ...schedule, ...updates, lastUpdated: new Date() };
    this.publicTransportSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  // Ride preference methods
  async getUserRidePreference(userId: number): Promise<RidePreference | undefined> {
    return Array.from(this.ridePreferences.values()).find(pref => pref.userId === userId);
  }

  async createRidePreference(insertPreference: InsertRidePreference): Promise<RidePreference> {
    const id = this.currentPreferenceId++;
    const preference: RidePreference = {
      ...insertPreference,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.ridePreferences.set(id, preference);
    return preference;
  }

  async updateRidePreference(userId: number, updates: Partial<RidePreference>): Promise<RidePreference | undefined> {
    const preference = Array.from(this.ridePreferences.values()).find(pref => pref.userId === userId);
    if (!preference) return undefined;

    const updatedPreference = { ...preference, ...updates, updatedAt: new Date() };
    this.ridePreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }

  // System alert methods
  async getSystemAlerts(): Promise<SystemAlert[]> {
    return Array.from(this.systemAlerts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createSystemAlert(insertAlert: InsertSystemAlert): Promise<SystemAlert> {
    const id = this.currentAlertId++;
    const alert: SystemAlert = {
      ...insertAlert,
      id,
      stationId: insertAlert.stationId || null,
      isResolved: insertAlert.isResolved !== undefined ? insertAlert.isResolved : null,
      resolvedAt: null,
      createdAt: new Date(),
    };
    this.systemAlerts.set(id, alert);
    return alert;
  }

  async updateSystemAlert(id: number, updates: Partial<SystemAlert>): Promise<SystemAlert | undefined> {
    const alert = this.systemAlerts.get(id);
    if (!alert) return undefined;

    const updatedAlert = { ...alert, ...updates };
    if (updates.isResolved && !alert.isResolved) {
      updatedAlert.resolvedAt = new Date();
    }
    this.systemAlerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

export const storage = new MemStorage();
