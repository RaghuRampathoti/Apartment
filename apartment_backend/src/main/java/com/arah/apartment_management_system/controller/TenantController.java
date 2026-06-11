package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.tenant.CreateTenantRequest;
import com.arah.apartment_management_system.dto.tenant.TenantResponse;
import com.arah.apartment_management_system.service.TenantService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RESIDENT', 'TENANT')")
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ApiResponse<TenantResponse> addTenant(@RequestBody CreateTenantRequest request) {
        return ApiResponse.success("Tenant added successfully", tenantService.addTenant(request));
    }

    @GetMapping
    public ApiResponse<List<TenantResponse>> getMyTenants() {
        return ApiResponse.success("Tenants fetched successfully", tenantService.getMyTenants());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> removeTenant(@PathVariable Long id) {
        tenantService.removeTenant(id);
        return ApiResponse.success("Tenant removed successfully", null);
    }

    @PatchMapping("/{id}/reactivate")
    public ApiResponse<String> reactivateTenant(@PathVariable Long id) {
        tenantService.reactivateTenant(id);
        return ApiResponse.success("Tenant reactivated successfully", null);
    }

    @GetMapping("/{id}/rent-records")
    public ApiResponse<List<com.arah.apartment_management_system.dto.tenant.TenantRentRecordDto>> getRentRecords(@PathVariable Long id) {
        return ApiResponse.success("Rent records fetched successfully", tenantService.getTenantRentRecords(id));
    }

    @PatchMapping("/rent-records/{recordId}")
    public ApiResponse<com.arah.apartment_management_system.dto.tenant.TenantRentRecordDto> updateRentRecordStatus(
            @PathVariable Long recordId,
            @RequestParam Boolean isPaid) {
        return ApiResponse.success("Rent record updated successfully", tenantService.updateTenantRentRecordStatus(recordId, isPaid));
    }
}
