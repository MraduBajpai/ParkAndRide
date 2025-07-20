package com.parkandride.service;

import com.parkandride.dto.ParkingBookingRequest;
import com.parkandride.exception.ResourceNotFoundException;
import com.parkandride.exception.BookingConflictException;
import com.parkandride.model.*;
import com.parkandride.repository.*;
import com.parkandride.util.QRCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class ParkingService {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @Autowired
    private ParkingSpotRepository parkingSpotRepository;

    @Autowired
    private ParkingBookingRepository parkingBookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PricingService pricingService;

    @Autowired
    private QRCodeGenerator qrCodeGenerator;

    @Cacheable("parkingLots")
    public List<ParkingLot> getAvailableParkingLots() {
        return parkingLotRepository.findAvailableParkingLots(ParkingLotStatus.ACTIVE);
    }

    @Cacheable("parkingLotsByStation")
    public List<ParkingLot> getParkingLotsByMetroStation(String stationName) {
        return parkingLotRepository.findByMetroStationNameAndStatus(stationName, ParkingLotStatus.ACTIVE);
    }

    public List<ParkingLot> getNearbyParkingLots(Double latitude, Double longitude, Double radiusInMeters) {
        return parkingLotRepository.findNearbyParkingLots(latitude, longitude, radiusInMeters);
    }

    public ParkingBooking createBooking(ParkingBookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingLot parkingLot = parkingLotRepository.findById(request.getParkingLotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found"));

        // Check for conflicts
        if (hasBookingConflict(request.getParkingLotId(), request.getStartTime(), request.getEndTime())) {
            throw new BookingConflictException("Booking conflicts with existing reservations");
        }

        // Calculate pricing
        BigDecimal totalAmount = pricingService.calculateParkingPrice(
                parkingLot, request.getStartTime(), request.getEndTime(), request.getBookingType());

        // Find available spot
        Optional<ParkingSpot> availableSpot = findAvailableSpot(request.getParkingLotId(), 
                request.getStartTime(), request.getEndTime());

        ParkingBooking booking = new ParkingBooking(user, parkingLot, request.getStartTime(), 
                request.getEndTime(), totalAmount);
        booking.setBookingType(request.getBookingType());
        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setAccessPin(generateAccessPin());

        if (availableSpot.isPresent()) {
            booking.setParkingSpot(availableSpot.get());
            // Update spot status
            availableSpot.get().setStatus(SpotStatus.RESERVED);
            parkingSpotRepository.save(availableSpot.get());
        }

        // Update available spots count
        parkingLot.setAvailableSpots(parkingLot.getAvailableSpots() - 1);
        parkingLotRepository.save(parkingLot);

        booking = parkingBookingRepository.save(booking);

        // Generate QR code
        try {
            String qrCode = qrCodeGenerator.generateBookingQRCode(booking.getId(), booking.getAccessPin());
            booking.setQrCode(qrCode);
            booking = parkingBookingRepository.save(booking);
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to generate QR code: " + e.getMessage());
        }

        return booking;
    }

    public ParkingBooking getBookingById(Long bookingId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return parkingBookingRepository.findById(bookingId)
                .filter(booking -> booking.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    public List<ParkingBooking> getUserBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return parkingBookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public ParkingBooking cancelBooking(Long bookingId, String username) {
        ParkingBooking booking = getBookingById(bookingId, username);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel booking in current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Free up the parking spot
        if (booking.getParkingSpot() != null) {
            booking.getParkingSpot().setStatus(SpotStatus.AVAILABLE);
            parkingSpotRepository.save(booking.getParkingSpot());
        }

        // Update available spots count
        ParkingLot parkingLot = booking.getParkingLot();
        parkingLot.setAvailableSpots(parkingLot.getAvailableSpots() + 1);
        parkingLotRepository.save(parkingLot);

        return parkingBookingRepository.save(booking);
    }

    public ParkingBooking startParking(Long bookingId, String username) {
        ParkingBooking booking = getBookingById(bookingId, username);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot start parking for booking in status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.ACTIVE);
        booking.setActualStartTime(LocalDateTime.now());

        if (booking.getParkingSpot() != null) {
            booking.getParkingSpot().setStatus(SpotStatus.OCCUPIED);
            parkingSpotRepository.save(booking.getParkingSpot());
        }

        return parkingBookingRepository.save(booking);
    }

    public ParkingBooking endParking(Long bookingId, String username) {
        ParkingBooking booking = getBookingById(bookingId, username);

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new IllegalStateException("Cannot end parking for booking in status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setActualEndTime(LocalDateTime.now());

        if (booking.getParkingSpot() != null) {
            booking.getParkingSpot().setStatus(SpotStatus.AVAILABLE);
            parkingSpotRepository.save(booking.getParkingSpot());
        }

        // Update available spots count
        ParkingLot parkingLot = booking.getParkingLot();
        parkingLot.setAvailableSpots(parkingLot.getAvailableSpots() + 1);
        parkingLotRepository.save(parkingLot);

        return parkingBookingRepository.save(booking);
    }

    public ParkingBooking validateQRAccess(String qrCode) {
        return parkingBookingRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR code"));
    }

    public ParkingBooking validatePinAccess(Long bookingId, String accessPin) {
        return parkingBookingRepository.findByIdAndAccessPin(bookingId, accessPin)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid booking ID or access PIN"));
    }

    private boolean hasBookingConflict(Long parkingLotId, LocalDateTime startTime, LocalDateTime endTime) {
        Long activeBookings = parkingBookingRepository.countActiveBookingsInTimeRange(
                parkingLotId, startTime, endTime);
        
        ParkingLot parkingLot = parkingLotRepository.findById(parkingLotId).orElse(null);
        if (parkingLot == null) return true;
        
        return activeBookings >= parkingLot.getTotalSpots();
    }

    private Optional<ParkingSpot> findAvailableSpot(Long parkingLotId, LocalDateTime startTime, LocalDateTime endTime) {
        List<ParkingSpot> availableSpots = parkingSpotRepository.findAvailableSpots(parkingLotId, startTime, endTime);
        return availableSpots.stream().findFirst();
    }

    private String generateAccessPin() {
        return String.format("%04d", new Random().nextInt(10000));
    }
}