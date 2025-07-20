package com.parkandride.service;

import com.parkandride.model.BookingType;
import com.parkandride.model.ParkingLot;
import com.parkandride.model.RideType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class PricingService {

    @Value("${app.pricing.base-rate:50.0}")
    private Double baseRate;

    @Value("${app.pricing.peak-multiplier:1.5}")
    private Double peakMultiplier;

    @Value("${app.pricing.surge-multiplier:2.0}")
    private Double surgeMultiplier;

    @Cacheable("parkingPricing")
    public BigDecimal calculateParkingPrice(ParkingLot parkingLot, LocalDateTime startTime, 
                                          LocalDateTime endTime, BookingType bookingType) {
        long hours = ChronoUnit.HOURS.between(startTime, endTime);
        if (hours == 0) hours = 1; // Minimum 1 hour charge

        BigDecimal basePrice = parkingLot.getBaseHourlyRate();
        BigDecimal totalPrice = basePrice.multiply(BigDecimal.valueOf(hours));

        // Apply time-based multipliers
        if (isPeakHour(startTime)) {
            totalPrice = totalPrice.multiply(BigDecimal.valueOf(peakMultiplier));
        }

        // Apply surge pricing based on demand (simplified)
        if (isHighDemandPeriod(startTime)) {
            totalPrice = totalPrice.multiply(BigDecimal.valueOf(surgeMultiplier));
        }

        // Apply booking type discounts
        switch (bookingType) {
            case DAILY:
                totalPrice = totalPrice.multiply(BigDecimal.valueOf(0.9)); // 10% discount
                break;
            case MONTHLY:
                totalPrice = totalPrice.multiply(BigDecimal.valueOf(0.8)); // 20% discount
                break;
            default:
                break;
        }

        return totalPrice.setScale(2, RoundingMode.HALF_UP);
    }

    @Cacheable("ridePricing")
    public BigDecimal calculateRideFare(Double pickupLat, Double pickupLon, 
                                       Double dropoffLat, Double dropoffLon, 
                                       RideType rideType, LocalDateTime requestedTime) {
        // Calculate distance (simplified)
        double distance = calculateDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);
        
        BigDecimal baseFare = getBaseFareByRideType(rideType);
        BigDecimal distanceFare = BigDecimal.valueOf(distance * getPerKmRate(rideType));
        
        BigDecimal totalFare = baseFare.add(distanceFare);

        // Apply time-based multipliers
        if (isPeakHour(requestedTime)) {
            totalFare = totalFare.multiply(BigDecimal.valueOf(peakMultiplier));
        }

        return totalFare.setScale(2, RoundingMode.HALF_UP);
    }

    private boolean isPeakHour(LocalDateTime dateTime) {
        int hour = dateTime.getHour();
        // Peak hours: 7-10 AM and 5-8 PM
        return (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    }

    private boolean isHighDemandPeriod(LocalDateTime dateTime) {
        // Simplified demand calculation - could be based on actual booking data
        int dayOfWeek = dateTime.getDayOfWeek().getValue();
        int hour = dateTime.getHour();
        
        // High demand on weekdays during office hours
        return dayOfWeek <= 5 && hour >= 8 && hour <= 18;
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 5.0; // Default 5 km
        }
        
        // Haversine formula
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }

    private BigDecimal getBaseFareByRideType(RideType rideType) {
        return switch (rideType) {
            case CAB -> BigDecimal.valueOf(50);
            case SHUTTLE -> BigDecimal.valueOf(30);
            case E_RICKSHAW -> BigDecimal.valueOf(20);
            case AUTO_RICKSHAW -> BigDecimal.valueOf(25);
        };
    }

    private double getPerKmRate(RideType rideType) {
        return switch (rideType) {
            case CAB -> 12.0;
            case SHUTTLE -> 8.0;
            case E_RICKSHAW -> 6.0;
            case AUTO_RICKSHAW -> 10.0;
        };
    }
}