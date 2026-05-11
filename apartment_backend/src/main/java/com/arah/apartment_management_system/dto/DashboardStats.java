package com.arah.apartment_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalApartments;
    private long totalBlocks;
    private long totalFlats;
    private long totalResidents;
    private long totalStaff;
    private long activeComplaints;
    private long totalInquiries;
    private long newInquiries;
    private long totalDemos;
    private long scheduledDemos;
    private long totalSubscriptions;
    private double totalRevenue;
}
