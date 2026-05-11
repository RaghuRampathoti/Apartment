package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.ClientInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClientInquiryRepository extends JpaRepository<ClientInquiry, Long> {
    List<ClientInquiry> findAllByOrderByCreatedAtDesc();
}
