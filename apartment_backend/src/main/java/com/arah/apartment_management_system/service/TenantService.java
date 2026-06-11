package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.tenant.CreateTenantRequest;
import com.arah.apartment_management_system.dto.tenant.TenantResponse;

import java.util.List;

public interface TenantService {
    TenantResponse addTenant(CreateTenantRequest request);
    List<TenantResponse> getMyTenants();
    void removeTenant(Long tenantId);
    void reactivateTenant(Long tenantId);
    List<com.arah.apartment_management_system.dto.tenant.TenantRentRecordDto> getTenantRentRecords(Long tenantId);
    com.arah.apartment_management_system.dto.tenant.TenantRentRecordDto updateTenantRentRecordStatus(Long recordId, Boolean isPaid);
}
