package com.parkandride.controller;

import com.parkandride.dto.ParkingBookingRequest;
import com.parkandride.model.ParkingBooking;
import com.parkandride.model.ParkingLot;
import com.parkandride.service.ParkingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/parking")
@Tag(name = "Parking", description = "Parking management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ParkingController {

    @Autowired
    private ParkingService parkingService;

    @GetMapping("/lots")
    @Operation(summary = "Get all available parking lots", description = "Retrieve all active parking lots with available spots")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ParkingLot>> getAvailableParkingLots() {
        List<ParkingLot> parkingLots = parkingService.getAvailableParkingLots();
        return ResponseEntity.ok(parkingLots);
    }

    @GetMapping("/lots/metro/{stationName}")
    @Operation(summary = "Get parking lots by metro station", description = "Find parking lots near a specific metro station")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ParkingLot>> getParkingLotsByMetroStation(@PathVariable String stationName) {
        List<ParkingLot> parkingLots = parkingService.getParkingLotsByMetroStation(stationName);
        return ResponseEntity.ok(parkingLots);
    }

    @GetMapping("/lots/nearby")
    @Operation(summary = "Get nearby parking lots", description = "Find parking lots within a specified radius")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ParkingLot>> getNearbyParkingLots(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5000") Double radiusInMeters) {
        List<ParkingLot> parkingLots = parkingService.getNearbyParkingLots(latitude, longitude, radiusInMeters);
        return ResponseEntity.ok(parkingLots);
    }

    @PostMapping("/bookings")
    @Operation(summary = "Create parking booking", description = "Book a parking spot for specified time period")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> createBooking(@Valid @RequestBody ParkingBookingRequest request, 
                                                       Principal principal) {
        ParkingBooking booking = parkingService.createBooking(request, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get user bookings", description = "Retrieve all bookings for the authenticated user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ParkingBooking>> getUserBookings(Principal principal) {
        List<ParkingBooking> bookings = parkingService.getUserBookings(principal.getName());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{bookingId}")
    @Operation(summary = "Get booking details", description = "Retrieve specific booking details")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> getBooking(@PathVariable Long bookingId, Principal principal) {
        ParkingBooking booking = parkingService.getBookingById(bookingId, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{bookingId}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancel an existing parking booking")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> cancelBooking(@PathVariable Long bookingId, Principal principal) {
        ParkingBooking booking = parkingService.cancelBooking(bookingId, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{bookingId}/start")
    @Operation(summary = "Start parking", description = "Mark parking as started when user arrives")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> startParking(@PathVariable Long bookingId, Principal principal) {
        ParkingBooking booking = parkingService.startParking(bookingId, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{bookingId}/end")
    @Operation(summary = "End parking", description = "Mark parking as completed when user leaves")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> endParking(@PathVariable Long bookingId, Principal principal) {
        ParkingBooking booking = parkingService.endParking(bookingId, principal.getName());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/access/qr/{qrCode}")
    @Operation(summary = "Validate QR access", description = "Validate parking access using QR code")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> validateQRAccess(@PathVariable String qrCode) {
        ParkingBooking booking = parkingService.validateQRAccess(qrCode);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/access/pin/{bookingId}/{accessPin}")
    @Operation(summary = "Validate PIN access", description = "Validate parking access using booking ID and PIN")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ParkingBooking> validatePinAccess(@PathVariable Long bookingId, 
                                                           @PathVariable String accessPin) {
        ParkingBooking booking = parkingService.validatePinAccess(bookingId, accessPin);
        return ResponseEntity.ok(booking);
    }
}