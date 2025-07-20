package com.parkandride.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "parking_lots")
public class ParkingLot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String address;
    
    @NotNull
    private Double latitude;
    
    @NotNull
    private Double longitude;
    
    @NotNull
    @PositiveOrZero
    private Integer totalSpots;
    
    @NotNull
    @PositiveOrZero
    private Integer availableSpots;
    
    @NotNull
    private BigDecimal baseHourlyRate;
    
    private String metroStationName;
    private Double distanceFromMetro; // in meters
    
    @Enumerated(EnumType.STRING)
    private ParkingLotStatus status = ParkingLotStatus.ACTIVE;
    
    private String facilities; // JSON string for amenities
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "parkingLot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ParkingSpot> parkingSpots;
    
    @OneToMany(mappedBy = "parkingLot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ParkingBooking> bookings;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (availableSpots == null) {
            availableSpots = totalSpots;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public ParkingLot() {}
    
    public ParkingLot(String name, String address, Double latitude, Double longitude, 
                     Integer totalSpots, BigDecimal baseHourlyRate) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalSpots = totalSpots;
        this.baseHourlyRate = baseHourlyRate;
        this.availableSpots = totalSpots;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public Integer getTotalSpots() { return totalSpots; }
    public void setTotalSpots(Integer totalSpots) { this.totalSpots = totalSpots; }
    
    public Integer getAvailableSpots() { return availableSpots; }
    public void setAvailableSpots(Integer availableSpots) { this.availableSpots = availableSpots; }
    
    public BigDecimal getBaseHourlyRate() { return baseHourlyRate; }
    public void setBaseHourlyRate(BigDecimal baseHourlyRate) { this.baseHourlyRate = baseHourlyRate; }
    
    public String getMetroStationName() { return metroStationName; }
    public void setMetroStationName(String metroStationName) { this.metroStationName = metroStationName; }
    
    public Double getDistanceFromMetro() { return distanceFromMetro; }
    public void setDistanceFromMetro(Double distanceFromMetro) { this.distanceFromMetro = distanceFromMetro; }
    
    public ParkingLotStatus getStatus() { return status; }
    public void setStatus(ParkingLotStatus status) { this.status = status; }
    
    public String getFacilities() { return facilities; }
    public void setFacilities(String facilities) { this.facilities = facilities; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    public Set<ParkingSpot> getParkingSpots() { return parkingSpots; }
    public void setParkingSpots(Set<ParkingSpot> parkingSpots) { this.parkingSpots = parkingSpots; }
    
    public Set<ParkingBooking> getBookings() { return bookings; }
    public void setBookings(Set<ParkingBooking> bookings) { this.bookings = bookings; }
}

enum ParkingLotStatus {
    ACTIVE, INACTIVE, MAINTENANCE
}