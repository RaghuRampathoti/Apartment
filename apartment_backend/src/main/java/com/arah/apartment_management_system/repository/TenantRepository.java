package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    List<Tenant> findByResidentIdAndIsActiveTrue(Long residentId);

    List<Tenant> findByResidentId(Long residentId);

    List<Tenant> findByFlatIdAndIsActiveTrue(Long flatId);

    java.util.Optional<Tenant> findByLinkedUser_Id(Long linkedUserId);
}
