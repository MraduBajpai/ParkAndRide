package com.parkandride.controller;

import com.parkandride.dto.RideBookingRequest;
import com.parkandride.model.RideBooking;
import com.parkandride.model.RideStatus;
import com.parkandride.service.RideService;
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
@RequestMapping("/api/rides")
@Tag(name = "Rides", description = "Last-mile ride booking APIs")
@SecurityRequirement(name = "bearerAuth")
public class RideController {

    @Autowired
    private RideService rideService;

    @PostMapping("/bookings")
    @Operation(summary = "Create ride booking", description = "Book a last-mile ride (cab, shuttle, e-rickshaw)")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<RideBooking> createRideBooking(@Valid @RequestBody RideBookingRequest request, 
                                                        Principal principal) {
        RideBooking rideBooking = rideService.createRideBooking(request, principal.getName());
        return ResponseEntity.ok(rideBooking);
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get user ride bookings", description = "Retrieve all ride bookings for the authenticated user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<RideBooking>> getUserRideBookings(Principal principal) {
        List<RideBooking> rideBookings = rideService.getUserRideBookings(principal.getName());
        return ResponseEntity.ok(rideBookings);
    }

    @GetMapping("/bookings/{rideId}")
    @Operation(summary = "Get ride booking details", description = "Retrieve specific ride booking details")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<RideBooking> getRideBooking(@PathVariable Long rideId, Principal principal) {
        RideBooking rideBooking = rideService.getRideBookingById(rideId, principal.getName());
        return ResponseEntity.ok(rideBooking);
    }

    @PutMapping("/bookings/{rideId}/cancel")
    @Operation(summary = "Cancel ride booking", description = "Cancel an existing ride booking")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<RideBooking> cancelRideBooking(@PathVariable Long rideId, Principal principal) {
        RideBooking rideBooking = rideService.cancelRideBooking(rideId, principal.getName());
        return ResponseEntity.ok(rideBooking);
    }

    @PutMapping("/bookings/{rideId}/status")
    @Operation(summary = "Update ride status", description = "Update the status of a ride booking")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<RideBooking> updateRideStatus(@PathVariable Long rideId, 
                                                       @RequestParam RideStatus status, 
                                                       Principal principal) {
        RideBooking rideBooking = rideService.updateRideStatus(rideId, status, principal.getName());
        return ResponseEntity.ok(rideBooking);
    }
}