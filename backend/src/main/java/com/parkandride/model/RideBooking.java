package com.parkandride.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ride_bookings")
public class RideBooking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_booking_id")
    private ParkingBooking parkingBooking;
    
    @NotNull
    private String pickupLocation;
    
    @NotNull
    private String dropoffLocation;
    
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
    
    @NotNull
    private LocalDateTime requestedTime;
    
    private LocalDateTime scheduledTime;
    private LocalDateTime actualPickupTime;
    private LocalDateTime actualDropoffTime;
    
    @Enumerated(EnumType.STRING)
    private RideType rideType = RideType.CAB;
    
    @Enumerated(EnumType.STRING)
    private RideStatus status = RideStatus.REQUESTED;
    
    private BigDecimal estimatedFare;
    private BigDecimal actualFare;
    
    private String driverName;
    private String driverPhone;
    private String vehicleNumber;
    private String vehicleModel;
    
    private Integer maxPassengers = 1;
    private Boolean isShared = false;
    
    private String routeOptimizationId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public RideBooking() {}
    
    public RideBooking(User user, String pickupLocation, String dropoffLocation, 
                      LocalDateTime requestedTime, RideType rideType) {
        this.user = user;
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
        this.requestedTime = requestedTime;
        this.rideType = rideType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public ParkingBooking getParkingBooking() { return parkingBooking; }
    public void setParkingBooking(ParkingBooking parkingBooking) { this.parkingBooking = parkingBooking; }
    
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
    
    public LocalDateTime getActualPickupTime() { return actualPickupTime; }
    public void setActualPickupTime(LocalDateTime actualPickupTime) { this.actualPickupTime = actualPickupTime; }
    
    public LocalDateTime getActualDropoffTime() { return actualDropoffTime; }
    public void setActualDropoffTime(LocalDateTime actualDropoffTime) { this.actualDropoffTime = actualDropoffTime; }
    
    public RideType getRideType() { return rideType; }
    public void setRideType(RideType rideType) { this.rideType = rideType; }
    
    public RideStatus getStatus() { return status; }
    public void setStatus(RideStatus status) { this.status = status; }
    
    public BigDecimal getEstimatedFare() { return estimatedFare; }
    public void setEstimatedFare(BigDecimal estimatedFare) { this.estimatedFare = estimatedFare; }
    
    public BigDecimal getActualFare() { return actualFare; }
    public void setActualFare(BigDecimal actualFare) { this.actualFare = actualFare; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }
    
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    
    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }
    
    public Integer getMaxPassengers() { return maxPassengers; }
    public void setMaxPassengers(Integer maxPassengers) { this.maxPassengers = maxPassengers; }
    
    public Boolean getIsShared() { return isShared; }
    public void setIsShared(Boolean isShared) { this.isShared = isShared; }
    
    public String getRouteOptimizationId() { return routeOptimizationId; }
    public void setRouteOptimizationId(String routeOptimizationId) { this.routeOptimizationId = routeOptimizationId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

enum RideType {
    CAB, SHUTTLE, E_RICKSHAW, AUTO_RICKSHAW
}

enum RideStatus {
    REQUESTED, CONFIRMED, DRIVER_ASSIGNED, PICKUP, IN_PROGRESS, COMPLETED, CANCELLED
}