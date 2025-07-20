package com.parkandride.service;

import com.parkandride.dto.RideBookingRequest;
import com.parkandride.exception.ResourceNotFoundException;
import com.parkandride.model.*;
import com.parkandride.repository.RideBookingRepository;
import com.parkandride.repository.UserRepository;
import com.parkandride.repository.ParkingBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RideService {

    @Autowired
    private RideBookingRepository rideBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingBookingRepository parkingBookingRepository;

    @Autowired
    private PricingService pricingService;

    public RideBooking createRideBooking(RideBookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RideBooking rideBooking = new RideBooking(user, request.getPickupLocation(), 
                request.getDropoffLocation(), request.getRequestedTime(), request.getRideType());
        
        rideBooking.setPickupLatitude(request.getPickupLatitude());
        rideBooking.setPickupLongitude(request.getPickupLongitude());
        rideBooking.setDropoffLatitude(request.getDropoffLatitude());
        rideBooking.setDropoffLongitude(request.getDropoffLongitude());
        rideBooking.setScheduledTime(request.getScheduledTime());
        rideBooking.setMaxPassengers(request.getMaxPassengers());
        rideBooking.setIsShared(request.getIsShared());

        // Link to parking booking if provided
        if (request.getParkingBookingId() != null) {
            ParkingBooking parkingBooking = parkingBookingRepository.findById(request.getParkingBookingId())
                    .filter(pb -> pb.getUser().getId().equals(user.getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Parking booking not found"));
            rideBooking.setParkingBooking(parkingBooking);
        }

        // Calculate estimated fare
        BigDecimal estimatedFare = pricingService.calculateRideFare(
                rideBooking.getPickupLatitude(), rideBooking.getPickupLongitude(),
                rideBooking.getDropoffLatitude(), rideBooking.getDropoffLongitude(),
                request.getRideType(), request.getRequestedTime());
        rideBooking.setEstimatedFare(estimatedFare);

        // Handle ride pooling
        if (request.getIsShared()) {
            handleRidePooling(rideBooking);
        } else {
            assignDriver(rideBooking);
        }

        return rideBookingRepository.save(rideBooking);
    }

    public List<RideBooking> getUserRideBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return rideBookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public RideBooking getRideBookingById(Long rideId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return rideBookingRepository.findById(rideId)
                .filter(ride -> ride.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Ride booking not found"));
    }

    public RideBooking cancelRideBooking(Long rideId, String username) {
        RideBooking rideBooking = getRideBookingById(rideId, username);

        if (rideBooking.getStatus() == RideStatus.COMPLETED || rideBooking.getStatus() == RideStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel ride in current status: " + rideBooking.getStatus());
        }

        rideBooking.setStatus(RideStatus.CANCELLED);
        return rideBookingRepository.save(rideBooking);
    }

    public RideBooking updateRideStatus(Long rideId, RideStatus status, String username) {
        RideBooking rideBooking = getRideBookingById(rideId, username);
        
        rideBooking.setStatus(status);
        
        switch (status) {
            case PICKUP:
                rideBooking.setActualPickupTime(LocalDateTime.now());
                break;
            case COMPLETED:
                rideBooking.setActualDropoffTime(LocalDateTime.now());
                break;
            default:
                break;
        }
        
        return rideBookingRepository.save(rideBooking);
    }

    private void handleRidePooling(RideBooking rideBooking) {
        // Find existing shared rides in the same area and time window
        LocalDateTime windowStart = rideBooking.getRequestedTime().minusMinutes(15);
        LocalDateTime windowEnd = rideBooking.getRequestedTime().plusMinutes(15);
        
        List<RideBooking> availableSharedRides = rideBookingRepository.findAvailableSharedRides();
        
        // Simple pooling logic - in real implementation, this would use route optimization
        for (RideBooking existingRide : availableSharedRides) {
            if (isWithinPoolingDistance(rideBooking, existingRide)) {
                rideBooking.setRouteOptimizationId(existingRide.getRouteOptimizationId());
                rideBooking.setStatus(RideStatus.CONFIRMED);
                copyDriverDetails(existingRide, rideBooking);
                return;
            }
        }
        
        // No suitable shared ride found, create new one
        rideBooking.setRouteOptimizationId(UUID.randomUUID().toString());
        assignDriver(rideBooking);
    }

    private boolean isWithinPoolingDistance(RideBooking ride1, RideBooking ride2) {
        // Simple distance check - in real implementation, use proper geospatial calculations
        double pickupDistance = calculateDistance(
                ride1.getPickupLatitude(), ride1.getPickupLongitude(),
                ride2.getPickupLatitude(), ride2.getPickupLongitude());
        
        double dropoffDistance = calculateDistance(
                ride1.getDropoffLatitude(), ride1.getDropoffLongitude(),
                ride2.getDropoffLatitude(), ride2.getDropoffLongitude());
        
        return pickupDistance <= 1000 && dropoffDistance <= 1000; // 1km radius
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }
        
        // Haversine formula for distance calculation
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c * 1000; // Distance in meters
    }

    private void assignDriver(RideBooking rideBooking) {
        // Mock driver assignment - in real implementation, this would integrate with driver service
        rideBooking.setStatus(RideStatus.CONFIRMED);
        rideBooking.setDriverName("Driver " + (rideBooking.getId() % 100));
        rideBooking.setDriverPhone("+91" + (9000000000L + (rideBooking.getId() % 100000)));
        rideBooking.setVehicleNumber("KA" + String.format("%02d", rideBooking.getId() % 100) + "AB1234");
        rideBooking.setVehicleModel(getVehicleModelByType(rideBooking.getRideType()));
    }

    private void copyDriverDetails(RideBooking sourceRide, RideBooking targetRide) {
        targetRide.setDriverName(sourceRide.getDriverName());
        targetRide.setDriverPhone(sourceRide.getDriverPhone());
        targetRide.setVehicleNumber(sourceRide.getVehicleNumber());
        targetRide.setVehicleModel(sourceRide.getVehicleModel());
    }

    private String getVehicleModelByType(RideType rideType) {
        return switch (rideType) {
            case CAB -> "Maruti Swift";
            case SHUTTLE -> "Tata Winger";
            case E_RICKSHAW -> "Mahindra Treo";
            case AUTO_RICKSHAW -> "Bajaj Auto";
        };
    }
}