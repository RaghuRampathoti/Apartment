package com.arah.apartment_management_system.repository;

import com.arah.apartment_management_system.entity.TenantRentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantRentRecordRepository extends JpaRepository<TenantRentRecord, Long> {
    List<TenantRentRecord> findByTenantIdOrderByRentYearDescRentMonthDesc(Long tenantId);
    TenantRentRecord findByTenantIdAndRentYearAndRentMonth(Long tenantId, Integer rentYear, Integer rentMonth);
}
