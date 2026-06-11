package com.arah.apartment_management_system.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantRentRecordDto {
    private Long id;
    private Long tenantId;
    private Integer rentYear;
    private Integer rentMonth;
    private Double amount;
    private Boolean isPaid;
}
