package com.parkandride.repository;

import com.parkandride.model.BookingStatus;
import com.parkandride.model.ParkingBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingBookingRepository extends JpaRepository<ParkingBooking, Long> {
    
    List<ParkingBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<ParkingBooking> findByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<BookingStatus> statuses);
    
    @Query("SELECT pb FROM ParkingBooking pb WHERE pb.status IN :statuses AND pb.startTime <= :endTime AND pb.endTime >= :startTime")
    List<ParkingBooking> findConflictingBookings(@Param("statuses") List<BookingStatus> statuses,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT pb FROM ParkingBooking pb WHERE pb.status = 'CONFIRMED' AND pb.startTime <= :currentTime " +
           "AND pb.actualStartTime IS NULL")
    List<ParkingBooking> findBookingsToAutoCancel(@Param("currentTime") LocalDateTime currentTime);
    
    Optional<ParkingBooking> findByQrCode(String qrCode);
    
    Optional<ParkingBooking> findByIdAndAccessPin(Long id, String accessPin);
    
    @Query("SELECT COUNT(pb) FROM ParkingBooking pb WHERE pb.parkingLot.id = :parkingLotId " +
           "AND pb.status IN ('CONFIRMED', 'ACTIVE') AND pb.startTime <= :endTime AND pb.endTime >= :startTime")
    Long countActiveBookingsInTimeRange(@Param("parkingLotId") Long parkingLotId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);
}