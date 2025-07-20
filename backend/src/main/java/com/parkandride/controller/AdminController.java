package com.parkandride.controller;

import com.parkandride.model.ParkingLot;
import com.parkandride.model.ParkingLotStatus;
import com.parkandride.repository.ParkingBookingRepository;
import com.parkandride.repository.ParkingLotRepository;
import com.parkandride.repository.RideBookingRepository;
import com.parkandride.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin management APIs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @Autowired
    private ParkingBookingRepository parkingBookingRepository;

    @Autowired
    private RideBookingRepository rideBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard data", description = "Retrieve summary statistics for admin dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalParkingLots", parkingLotRepository.count());
        dashboard.put("totalParkingBookings", parkingBookingRepository.count());
        dashboard.put("totalRideBookings", rideBookingRepository.count());
        
        List<ParkingLot> activeParkingLots = parkingLotRepository.findByStatusOrderByDistanceFromMetroAsc(ParkingLotStatus.ACTIVE);
        dashboard.put("activeParkingLots", activeParkingLots.size());
        
        int totalSpots = activeParkingLots.stream().mapToInt(ParkingLot::getTotalSpots).sum();
        int availableSpots = activeParkingLots.stream().mapToInt(ParkingLot::getAvailableSpots).sum();
        dashboard.put("totalSpots", totalSpots);
        dashboard.put("availableSpots", availableSpots);
        dashboard.put("occupancyRate", totalSpots > 0 ? (double)(totalSpots - availableSpots) / totalSpots * 100 : 0);
        
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/parking-lots")
    @Operation(summary = "Get all parking lots", description = "Retrieve all parking lots for admin management")
    public ResponseEntity<List<ParkingLot>> getAllParkingLots() {
        List<ParkingLot> parkingLots = parkingLotRepository.findAll();
        return ResponseEntity.ok(parkingLots);
    }

    @PostMapping("/parking-lots")
    @Operation(summary = "Create parking lot", description = "Add a new parking lot to the system")
    public ResponseEntity<ParkingLot> createParkingLot(@RequestBody ParkingLot parkingLot) {
        ParkingLot savedParkingLot = parkingLotRepository.save(parkingLot);
        return ResponseEntity.ok(savedParkingLot);
    }

    @PutMapping("/parking-lots/{lotId}")
    @Operation(summary = "Update parking lot", description = "Update an existing parking lot")
    public ResponseEntity<ParkingLot> updateParkingLot(@PathVariable Long lotId, 
                                                      @RequestBody ParkingLot parkingLot) {
        return parkingLotRepository.findById(lotId)
                .map(existingLot -> {
                    existingLot.setName(parkingLot.getName());
                    existingLot.setAddress(parkingLot.getAddress());
                    existingLot.setLatitude(parkingLot.getLatitude());
                    existingLot.setLongitude(parkingLot.getLongitude());
                    existingLot.setTotalSpots(parkingLot.getTotalSpots());
                    existingLot.setBaseHourlyRate(parkingLot.getBaseHourlyRate());
                    existingLot.setMetroStationName(parkingLot.getMetroStationName());
                    existingLot.setDistanceFromMetro(parkingLot.getDistanceFromMetro());
                    existingLot.setStatus(parkingLot.getStatus());
                    existingLot.setFacilities(parkingLot.getFacilities());
                    return ResponseEntity.ok(parkingLotRepository.save(existingLot));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/parking-lots/{lotId}/status")
    @Operation(summary = "Update parking lot status", description = "Change the status of a parking lot")
    public ResponseEntity<ParkingLot> updateParkingLotStatus(@PathVariable Long lotId, 
                                                           @RequestParam ParkingLotStatus status) {
        return parkingLotRepository.findById(lotId)
                .map(parkingLot -> {
                    parkingLot.setStatus(status);
                    return ResponseEntity.ok(parkingLotRepository.save(parkingLot));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/parking-lots/{lotId}")
    @Operation(summary = "Delete parking lot", description = "Remove a parking lot from the system")
    public ResponseEntity<?> deleteParkingLot(@PathVariable Long lotId) {
        return parkingLotRepository.findById(lotId)
                .map(parkingLot -> {
                    parkingLotRepository.delete(parkingLot);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/analytics/revenue")
    @Operation(summary = "Get revenue analytics", description = "Retrieve revenue analytics data")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Mock revenue data - in real implementation, calculate from actual booking data
        analytics.put("totalRevenue", 125000.50);
        analytics.put("parkingRevenue", 75000.30);
        analytics.put("rideRevenue", 50000.20);
        analytics.put("monthlyGrowth", 12.5);
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/usage")
    @Operation(summary = "Get usage analytics", description = "Retrieve system usage analytics")
    public ResponseEntity<Map<String, Object>> getUsageAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Mock usage data - in real implementation, calculate from actual data
        analytics.put("dailyActiveUsers", 1250);
        analytics.put("averageBookingsPerUser", 3.2);
        analytics.put("peakUsageHours", "8-10 AM, 5-7 PM");
        analytics.put("mostPopularMetroStations", List.of("Rajiv Chowk", "Connaught Place", "Kashmere Gate"));
        
        return ResponseEntity.ok(analytics);
    }
}