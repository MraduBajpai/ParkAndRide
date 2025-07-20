package com.parkandride.repository;

import com.parkandride.model.RideBooking;
import com.parkandride.model.RideStatus;
import com.parkandride.model.RideType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideBookingRepository extends JpaRepository<RideBooking, Long> {
    
    List<RideBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<RideBooking> findByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<RideStatus> statuses);
    
    @Query("SELECT rb FROM RideBooking rb WHERE rb.status = :status AND rb.rideType = :rideType " +
           "AND rb.requestedTime BETWEEN :startTime AND :endTime")
    List<RideBooking> findRidesForPooling(@Param("status") RideStatus status,
                                         @Param("rideType") RideType rideType,
                                         @Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT rb FROM RideBooking rb WHERE rb.isShared = true AND rb.status = 'CONFIRMED' " +
           "AND rb.maxPassengers > (SELECT COUNT(rb2) FROM RideBooking rb2 WHERE rb2.routeOptimizationId = rb.routeOptimizationId)")
    List<RideBooking> findAvailableSharedRides();
}