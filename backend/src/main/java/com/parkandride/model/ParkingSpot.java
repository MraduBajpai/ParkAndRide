package com.parkandride.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "parking_spots")
public class ParkingSpot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String spotNumber;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_lot_id")
    private ParkingLot parkingLot;
    
    @Enumerated(EnumType.STRING)
    private SpotType spotType = SpotType.REGULAR;
    
    @Enumerated(EnumType.STRING)
    private SpotStatus status = SpotStatus.AVAILABLE;
    
    private String floor;
    private String section;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "parkingSpot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ParkingBooking> bookings;
    
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
    public ParkingSpot() {}
    
    public ParkingSpot(String spotNumber, ParkingLot parkingLot) {
        this.spotNumber = spotNumber;
        this.parkingLot = parkingLot;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSpotNumber() { return spotNumber; }
    public void setSpotNumber(String spotNumber) { this.spotNumber = spotNumber; }
    
    public ParkingLot getParkingLot() { return parkingLot; }
    public void setParkingLot(ParkingLot parkingLot) { this.parkingLot = parkingLot; }
    
    public SpotType getSpotType() { return spotType; }
    public void setSpotType(SpotType spotType) { this.spotType = spotType; }
    
    public SpotStatus getStatus() { return status; }
    public void setStatus(SpotStatus status) { this.status = status; }
    
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    public Set<ParkingBooking> getBookings() { return bookings; }
    public void setBookings(Set<ParkingBooking> bookings) { this.bookings = bookings; }
}

enum SpotType {
    REGULAR, COMPACT, DISABLED, ELECTRIC
}

enum SpotStatus {
    AVAILABLE, OCCUPIED, RESERVED, OUT_OF_ORDER
}