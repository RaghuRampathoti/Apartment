package com.arah.apartment_management_system.scheduler;

import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.Maintenance;
import com.arah.apartment_management_system.enums.FlatStatus;
import com.arah.apartment_management_system.enums.PaymentStatus;
import com.arah.apartment_management_system.repository.FlatRepository;
import com.arah.apartment_management_system.repository.MaintenanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class MaintenanceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(MaintenanceScheduler.class);
    private final FlatRepository flatRepository;
    private final MaintenanceRepository maintenanceRepository;

    private static final Double BASIC_MAINTENANCE_AMOUNT = 1500.0; // Monthly basic amount

    // Run on the 1st day of every month at midnight
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void generateMonthlyMaintenanceBills() {
        logger.info("Starting monthly maintenance bill generation job...");

        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        List<Flat> allocatedFlats = flatRepository.findByStatus(FlatStatus.ALLOCATED);

        int generatedCount = 0;

        for (Flat flat : allocatedFlats) {
            // Check if maintenance for this month already exists
            Optional<Maintenance> existingMaintenance = maintenanceRepository.findByFlatAndMonthAndYear(flat, currentMonth, currentYear);
            if (existingMaintenance.isPresent()) {
                continue; // Skip if already generated for this month
            }

            // Find unpaid previous maintenance
            List<Maintenance> unpaidMaintenances = maintenanceRepository.findByFlatAndPaymentStatusIn(
                    flat, Arrays.asList(PaymentStatus.PENDING, PaymentStatus.OVERDUE)
            );

            double unpaidAmount = 0.0;
            for (Maintenance unpaid : unpaidMaintenances) {
                // Ensure we only process bills from previous months
                if (unpaid.getYear() < currentYear || (unpaid.getYear() == currentYear && unpaid.getMonth() < currentMonth)) {
                    unpaidAmount += unpaid.getAmount();
                    // Delete old unpaid bills to merge them into the new bill and avoid double payment
                    maintenanceRepository.delete(unpaid);
                }
            }

            // Create new maintenance record
            Maintenance newMaintenance = new Maintenance();
            newMaintenance.setFlat(flat);
            newMaintenance.setMonth(currentMonth);
            newMaintenance.setYear(currentYear);
            newMaintenance.setAmount(BASIC_MAINTENANCE_AMOUNT + unpaidAmount);
            newMaintenance.setDueDate(today.plusDays(15));
            newMaintenance.setPaymentStatus(PaymentStatus.PENDING);

            maintenanceRepository.save(newMaintenance);
            generatedCount++;
        }

        logger.info("Generated {} maintenance bills for the month of {}/{}", generatedCount, currentMonth, currentYear);
    }
}
