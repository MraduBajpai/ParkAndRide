package com.parkandride.dto;

import com.parkandride.model.RideType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class RideBookingRequest {
    
    @NotBlank
    private String pickupLocation;
    
    @NotBlank
    private String dropoffLocation;
    
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
    
    @NotNull
    private LocalDateTime requestedTime;
    
    private LocalDateTime scheduledTime;
    
    @NotNull
    private RideType rideType = RideType.CAB;
    
    private Integer maxPassengers = 1;
    private Boolean isShared = false;
    
    private Long parkingBookingId;
    
    public RideBookingRequest() {}
    
    public RideBookingRequest(String pickupLocation, String dropoffLocation, 
                             LocalDateTime requestedTime, RideType rideType) {
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
        this.requestedTime = requestedTime;
        this.rideType = rideType;
    }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }
    
    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
    
    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
    
    public Double getDropoffLatitude() { return dropoffLatitude; }
    public void setDropoffLatitude(Double dropoffLatitude) { this.dropoffLatitude = dropoffLatitude; }
    
    public Double getDropoffLongitude() { return dropoffLongitude; }
    public void setDropoffLongitude(Double dropoffLongitude) { this.dropoffLongitude = dropoffLongitude; }
    
    public LocalDateTime getRequestedTime() { return requestedTime; }
    public void setRequestedTime(LocalDateTime requestedTime) { this.requestedTime = requestedTime; }
    
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    
    public RideType getRideType() { return rideType; }
    public void setRideType(RideType rideType) { this.rideType = rideType; }
    
    public Integer getMaxPassengers() { return maxPassengers; }
    public void setMaxPassengers(Integer maxPassengers) { this.maxPassengers = maxPassengers; }
    
    public Boolean getIsShared() { return isShared; }
    public void setIsShared(Boolean isShared) { this.isShared = isShared; }
    
    public Long getParkingBookingId() { return parkingBookingId; }
    public void setParkingBookingId(Long parkingBookingId) { this.parkingBookingId = parkingBookingId; }
}