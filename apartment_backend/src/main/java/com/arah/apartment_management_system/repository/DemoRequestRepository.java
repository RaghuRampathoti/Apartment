package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.DemoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DemoRequestRepository extends JpaRepository<DemoRequest, Long> {
    List<DemoRequest> findAllByOrderByCreatedAtDesc();
}
