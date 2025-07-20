package com.parkandride.repository;

import com.parkandride.model.ParkingSpot;
import com.parkandride.model.SpotStatus;
import com.parkandride.model.SpotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    
    List<ParkingSpot> findByParkingLotIdAndStatus(Long parkingLotId, SpotStatus status);
    
    List<ParkingSpot> findByParkingLotIdAndStatusAndSpotType(Long parkingLotId, SpotStatus status, SpotType spotType);
    
    @Query("SELECT ps FROM ParkingSpot ps WHERE ps.parkingLot.id = :parkingLotId AND ps.status = 'AVAILABLE' " +
           "AND ps.id NOT IN (SELECT pb.parkingSpot.id FROM ParkingBooking pb WHERE pb.parkingSpot.id IS NOT NULL " +
           "AND pb.status IN ('CONFIRMED', 'ACTIVE') AND pb.startTime <= :endTime AND pb.endTime >= :startTime)")
    List<ParkingSpot> findAvailableSpots(@Param("parkingLotId") Long parkingLotId,
                                        @Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);
    
    Optional<ParkingSpot> findFirstByParkingLotIdAndStatusOrderBySpotNumberAsc(Long parkingLotId, SpotStatus status);
}