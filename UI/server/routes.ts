import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertParkingBookingSchema, 
  insertRideBookingSchema,
  insertSystemAlertSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parking Stations
  app.get("/api/parking-stations", async (req, res) => {
    try {
      const { search, lat, lng } = req.query;
      const stations = await storage.searchParkingStations(
        search as string,
        lat ? parseFloat(lat as string) : undefined,
        lng ? parseFloat(lng as string) : undefined
      );
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking stations" });
    }
  });

  app.get("/api/parking-stations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await storage.getParkingStation(id);
      if (!station) {
        return res.status(404).json({ message: "Parking station not found" });
      }
      res.json(station);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking station" });
    }
  });

  // Parking Spots
  app.get("/api/parking-stations/:id/spots", async (req, res) => {
    try {
      const stationId = parseInt(req.params.id);
      const spots = await storage.getParkingSpotsByStation(stationId);
      res.json(spots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking spots" });
    }
  });

  // Parking Bookings
  app.get("/api/users/:userId/bookings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getParkingBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertParkingBookingSchema.parse(req.body);
      const booking = await storage.createParkingBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getParkingBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const booking = await storage.updateParkingBooking(id, updates);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // QR Code Verification
  app.post("/api/qr/verify", async (req, res) => {
    try {
      const { qrCode } = req.body;
      if (!qrCode) {
        return res.status(400).json({ message: "QR code is required" });
      }

      const bookings = await storage.getParkingBookingsByUser(1); // In real app, get from auth
      const booking = bookings.find(b => b.qrCode === qrCode);
      
      if (!booking) {
        return res.status(404).json({ message: "Invalid QR code" });
      }

      const now = new Date();
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);

      if (now < startTime) {
        return res.status(400).json({ message: "Booking not yet active" });
      }

      if (now > endTime) {
        return res.status(400).json({ message: "Booking has expired" });
      }

      // Update check-in time if not already set
      if (!booking.checkInTime) {
        await storage.updateParkingBooking(booking.id, {
          checkInTime: now,
          status: "active"
        });
      }

      res.json({ 
        message: "Entry approved",
        booking: {
          ...booking,
          checkInTime: booking.checkInTime || now,
          status: booking.checkInTime ? booking.status : "active"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify QR code" });
    }
  });

  // Ride Bookings
  app.get("/api/users/:userId/rides", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const rides = await storage.getRideBookingsByUser(userId);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  app.post("/api/rides", async (req, res) => {
    try {
      const rideData = insertRideBookingSchema.parse(req.body);
      const ride = await storage.createRideBooking(rideData);
      res.status(201).json(ride);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ride data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ride booking" });
    }
  });

  app.patch("/api/rides/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const ride = await storage.updateRideBooking(id, updates);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ride" });
    }
  });

  // Enhanced Last-Mile Ride Features
  app.get("/api/users/:userId/rides/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activeRides = await storage.getActiveRideBookings(userId);
      res.json(activeRides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active rides" });
    }
  });

  app.post("/api/rides/pooling/search", async (req, res) => {
    try {
      const { pickupLocation, destination, scheduledTime } = req.body;
      
      if (!pickupLocation || !destination || !scheduledTime) {
        return res.status(400).json({ 
          message: "Missing required fields: pickupLocation, destination, scheduledTime" 
        });
      }

      const poolingRides = await storage.findPoolingRides(
        pickupLocation, 
        destination, 
        new Date(scheduledTime)
      );
      res.json(poolingRides);
    } catch (error) {
      res.status(500).json({ message: "Failed to search pooling rides" });
    }
  });

  // Public Transport Schedules
  app.get("/api/transport/schedules", async (req, res) => {
    try {
      const { from, to } = req.query;
      const schedules = await storage.getPublicTransportSchedules(
        from as string, 
        to as string
      );
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transport schedules" });
    }
  });

  // Ride Preferences
  app.get("/api/users/:userId/ride-preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const preferences = await storage.getUserRidePreference(userId);
      res.json(preferences || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride preferences" });
    }
  });

  app.put("/api/users/:userId/ride-preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      let preferences = await storage.getUserRidePreference(userId);
      
      if (preferences) {
        preferences = await storage.updateRidePreference(userId, req.body);
      } else {
        preferences = await storage.createRidePreference({
          ...req.body,
          userId
        });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ride preferences" });
    }
  });

  // System Alerts (Admin)
  app.get("/api/admin/alerts", async (req, res) => {
    try {
      const alerts = await storage.getSystemAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/admin/alerts", async (req, res) => {
    try {
      const alertData = insertSystemAlertSchema.parse(req.body);
      const alert = await storage.createSystemAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/admin/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const alert = await storage.updateSystemAlert(id, updates);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Dashboard Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stations = await storage.getParkingStations();
      const totalSpots = stations.reduce((sum, station) => sum + station.totalSpots, 0);
      const occupiedSpots = stations.reduce((sum, station) => sum + (station.totalSpots - station.availableSpots), 0);
      const occupancyRate = totalSpots > 0 ? (occupiedSpots / totalSpots * 100).toFixed(1) : "0";
      
      const alerts = await storage.getSystemAlerts();
      const activeAlerts = alerts.filter(alert => !alert.isResolved);

      // Mock revenue calculation
      const dailyRevenue = occupiedSpots * 25 * 8; // Avg rate * hours

      res.json({
        totalSpots,
        occupancyRate: parseFloat(occupancyRate),
        dailyRevenue,
        activeSensors: totalSpots - 56, // Mock offline sensors
        activeAlerts: activeAlerts.length,
        stations: stations.map(station => ({
          id: station.id,
          name: station.name,
          occupancyRate: ((station.totalSpots - station.availableSpots) / station.totalSpots * 100).toFixed(1)
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User Profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove sensitive data
      const { password, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
