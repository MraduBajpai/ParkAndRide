package com.parkandride.dto;

import com.parkandride.model.BookingType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ParkingBookingRequest {
    
    @NotNull
    private Long parkingLotId;
    
    @NotNull
    @Future
    private LocalDateTime startTime;
    
    @NotNull
    @Future
    private LocalDateTime endTime;
    
    private BookingType bookingType = BookingType.HOURLY;
    
    private String vehicleNumber;
    
    public ParkingBookingRequest() {}
    
    public ParkingBookingRequest(Long parkingLotId, LocalDateTime startTime, LocalDateTime endTime) {
        this.parkingLotId = parkingLotId;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    public Long getParkingLotId() { return parkingLotId; }
    public void setParkingLotId(Long parkingLotId) { this.parkingLotId = parkingLotId; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public BookingType getBookingType() { return bookingType; }
    public void setBookingType(BookingType bookingType) { this.bookingType = bookingType; }
    
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
}