package com.arah.apartment_management_system.dto.subscription;

import com.arah.apartment_management_system.enums.SubscriptionPlan;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionResponseDTO {
    private Long id;
    private Long apartmentId;
    private String apartmentName;
    private SubscriptionPlan plan;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double pricePaid;
    private boolean active;
    private LocalDateTime createdAt;
}
