package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ApartmentSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ApartmentSubscriptionRepository extends JpaRepository<ApartmentSubscription, Long> {

    List<ApartmentSubscription> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    @Query("SELECT s FROM ApartmentSubscription s WHERE s.apartment.id = :aptId " +
           "AND s.endDate >= :today ORDER BY s.endDate DESC")
    Optional<ApartmentSubscription> findActiveSubscription(@Param("aptId") Long aptId, @Param("today") LocalDate today);

    List<ApartmentSubscription> findAllByOrderByCreatedAtDesc();
}
