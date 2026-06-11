package com.arah.apartment_management_system.dto.subscription;

import com.arah.apartment_management_system.enums.SubscriptionPlan;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssignSubscriptionRequest {
    private Long apartmentId;
    private SubscriptionPlan plan;
    private LocalDate startDate;
    private LocalDate endDate;
}
