import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  rewardPoints: integer("reward_points").default(0),
  membershipLevel: text("membership_level").default("bronze"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parking locations/stations
export const parkingStations = pgTable("parking_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  totalSpots: integer("total_spots").notNull(),
  availableSpots: integer("available_spots").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 6, scale: 2 }).notNull(),
  amenities: text("amenities").array().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual parking spots
export const parkingSpots = pgTable("parking_spots", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").references(() => parkingStations.id).notNull(),
  spotNumber: text("spot_number").notNull(),
  level: text("level"),
  section: text("section"),
  spotType: text("spot_type").notNull(), // standard, ev_charging, disabled, compact
  isOccupied: boolean("is_occupied").default(false),
  isReserved: boolean("is_reserved").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Parking bookings
export const parkingBookings = pgTable("parking_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stationId: integer("station_id").references(() => parkingStations.id).notNull(),
  spotId: integer("spot_id").references(() => parkingSpots.id),
  vehiclePlate: text("vehicle_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, confirmed, active, completed, cancelled
  qrCode: text("qr_code"),
  paymentStatus: text("payment_status").default("pending"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ride bookings for last-mile connectivity
export const rideBookings = pgTable("ride_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  parkingBookingId: integer("parking_booking_id").references(() => parkingBookings.id),
  pickupLocation: text("pickup_location").notNull(),
  destination: text("destination").notNull(),
  rideType: text("ride_type").notNull(), // taxi, shared, shuttle, e_rickshaw
  bookingType: text("booking_type").notNull(), // instant, scheduled
  scheduledTime: timestamp("scheduled_time"),
  estimatedCost: decimal("estimated_cost", { precision: 6, scale: 2 }).notNull(),
  actualCost: decimal("actual_cost", { precision: 6, scale: 2 }),
  status: text("status").notNull(), // pending, confirmed, driver_assigned, in_progress, completed, cancelled
  driverInfo: jsonb("driver_info"),
  routeInfo: jsonb("route_info"),
  poolingEnabled: boolean("pooling_enabled").default(false),
  pooledWithRides: integer("pooled_with_rides").array().default([]),
  maxWaitTime: integer("max_wait_time").default(10), // minutes
  paymentMethod: text("payment_method").notNull(),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  trackingEnabled: boolean("tracking_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Public transport schedules
export const publicTransportSchedules = pgTable("public_transport_schedules", {
  id: serial("id").primaryKey(),
  transportType: text("transport_type").notNull(), // metro, bus
  routeName: text("route_name").notNull(),
  routeNumber: text("route_number"),
  fromStation: text("from_station").notNull(),
  toStation: text("to_station").notNull(),
  departureTime: text("departure_time").notNull(), // HH:MM format
  arrivalTime: text("arrival_time").notNull(),
  frequency: integer("frequency").notNull(), // minutes between services
  operatingDays: text("operating_days").array().default([]), // ['monday', 'tuesday', etc.]
  fare: decimal("fare", { precision: 6, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Ride preferences and history
export const ridePreferences = pgTable("ride_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  preferredRideType: text("preferred_ride_type").default("shared"),
  maxWaitTime: integer("max_wait_time").default(10),
  poolingPreference: boolean("pooling_preference").default(true),
  acPreference: boolean("ac_preference").default(true),
  musicPreference: boolean("music_preference").default(false),
  preferredPaymentMethod: text("preferred_payment_method").default("wallet"),
  frequentDestinations: text("frequent_destinations").array().default([]),
  commutePattern: jsonb("commute_pattern"), // stores ML insights
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System alerts for admin
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // sensor_malfunction, high_demand, maintenance, system_update
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  stationId: integer("station_id").references(() => parkingStations.id),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertParkingStationSchema = createInsertSchema(parkingStations).omit({
  id: true,
  createdAt: true,
});

export const insertParkingSpotSchema = createInsertSchema(parkingSpots).omit({
  id: true,
  lastUpdated: true,
});

export const insertParkingBookingSchema = createInsertSchema(parkingBookings).omit({
  id: true,
  createdAt: true,
  qrCode: true,
  checkInTime: true,
  checkOutTime: true,
});

export const insertRideBookingSchema = createInsertSchema(rideBookings).omit({
  id: true,
  createdAt: true,
  actualCost: true,
});

export const insertPublicTransportScheduleSchema = createInsertSchema(publicTransportSchedules).omit({
  id: true,
  lastUpdated: true,
});

export const insertRidePreferenceSchema = createInsertSchema(ridePreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ParkingStation = typeof parkingStations.$inferSelect;
export type InsertParkingStation = z.infer<typeof insertParkingStationSchema>;

export type ParkingSpot = typeof parkingSpots.$inferSelect;
export type InsertParkingSpot = z.infer<typeof insertParkingSpotSchema>;

export type ParkingBooking = typeof parkingBookings.$inferSelect;
export type InsertParkingBooking = z.infer<typeof insertParkingBookingSchema>;

export type RideBooking = typeof rideBookings.$inferSelect;
export type InsertRideBooking = z.infer<typeof insertRideBookingSchema>;

export type PublicTransportSchedule = typeof publicTransportSchedules.$inferSelect;
export type InsertPublicTransportSchedule = z.infer<typeof insertPublicTransportScheduleSchema>;

export type RidePreference = typeof ridePreferences.$inferSelect;
export type InsertRidePreference = z.infer<typeof insertRidePreferenceSchema>;

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
