package com.arah.apartment_management_system.dto.tenant;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTenantRequest {
    private String name;
    private String contactNumber;
    private String email;
    private String aadharNumber;
    private String maritalStatus;  // "Married" or "Bachelor"
    private LocalDate moveInDate;
    private Boolean isEmployee;
    private Double monthlyRent;

    // Tenant login credentials
    private String username;
    private String password;
}
