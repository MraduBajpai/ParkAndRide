package com.parkandride.repository;

import com.parkandride.model.ParkingLot;
import com.parkandride.model.ParkingLotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {
    
    List<ParkingLot> findByStatusOrderByDistanceFromMetroAsc(ParkingLotStatus status);
    
    @Query("SELECT p FROM ParkingLot p WHERE p.status = :status AND p.availableSpots > 0 " +
           "ORDER BY p.distanceFromMetro ASC")
    List<ParkingLot> findAvailableParkingLots(@Param("status") ParkingLotStatus status);
    
    @Query("SELECT p FROM ParkingLot p WHERE p.metroStationName = :stationName AND p.status = :status " +
           "ORDER BY p.distanceFromMetro ASC")
    List<ParkingLot> findByMetroStationNameAndStatus(@Param("stationName") String stationName, 
                                                     @Param("status") ParkingLotStatus status);
    
    @Query(value = "SELECT * FROM parking_lots p WHERE p.status = 'ACTIVE' AND " +
                   "ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:longitude, :latitude)) <= :radiusInMeters " +
                   "ORDER BY ST_Distance_Sphere(POINT(p.longitude, p.latitude), POINT(:longitude, :latitude))",
           nativeQuery = true)
    List<ParkingLot> findNearbyParkingLots(@Param("latitude") Double latitude, 
                                          @Param("longitude") Double longitude, 
                                          @Param("radiusInMeters") Double radiusInMeters);
}