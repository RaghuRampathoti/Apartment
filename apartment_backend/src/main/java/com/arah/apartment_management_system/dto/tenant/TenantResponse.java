package com.arah.apartment_management_system.dto.tenant;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TenantResponse {
    private Long id;
    private String name;
    private String contactNumber;
    private String email;
    private String aadharNumber;
    private String maritalStatus;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private Boolean isActive;
    private Boolean isEmployee;
    private Double monthlyRent;
    private String flatNumber;
    private String blockName;
    private String loginUsername;  // the login username created for this tenant
}
