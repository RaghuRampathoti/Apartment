package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.tenant.CreateTenantRequest;
import com.arah.apartment_management_system.dto.tenant.TenantResponse;
import com.arah.apartment_management_system.entity.Allotment;
import com.arah.apartment_management_system.entity.Flat;
import com.arah.apartment_management_system.entity.Tenant;
import com.arah.apartment_management_system.entity.User;
import com.arah.apartment_management_system.enums.AllotmentStatus;
import com.arah.apartment_management_system.enums.Role;
import com.arah.apartment_management_system.enums.UserStatus;
import com.arah.apartment_management_system.repository.AllotmentRepository;
import com.arah.apartment_management_system.repository.TenantRepository;
import com.arah.apartment_management_system.repository.UserRepository;
import com.arah.apartment_management_system.repository.TenantRentRecordRepository;
import com.arah.apartment_management_system.entity.TenantRentRecord;
import com.arah.apartment_management_system.dto.tenant.TenantRentRecordDto;
import com.arah.apartment_management_system.service.TenantService;
import com.arah.apartment_management_system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@SuppressWarnings("null")
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AllotmentRepository allotmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final TenantRentRecordRepository tenantRentRecordRepository;

    @Override
    public TenantResponse addTenant(CreateTenantRequest request) {
        User resident = userService.getLoggedInUser();

        // Validate login credentials
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new RuntimeException("Username is required for tenant login.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required for tenant login.");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }

        // Get the resident's active flat
        Flat flat = resident.getAllotments() == null ? null
                : resident.getAllotments().stream()
                        .filter(a -> a.getStatus() == AllotmentStatus.ACTIVE)
                        .findFirst()
                        .map(Allotment::getFlat)
                        .orElse(null);

        if (flat == null) {
            throw new RuntimeException("You do not have an active flat allotment to add tenants.");
        }

        // --- Create a login User for the tenant ---
        User tenantUser = new User();
        tenantUser.setUsername(request.getUsername());
        tenantUser.setEmail(request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail()
                : request.getUsername() + "@tenant.local");
        tenantUser.setPassword(passwordEncoder.encode(request.getPassword()));
        tenantUser.setRole(Role.ROLE_TENANT);
        tenantUser.setStatus(UserStatus.APPROVED);
        tenantUser.setContactNumber(request.getContactNumber());
        tenantUser.setDesignation("Tenant");
        User savedTenantUser = userRepository.save(tenantUser);

        // --- Allot the same flat to the tenant user ---
        Allotment allotment = new Allotment();
        allotment.setUser(savedTenantUser);
        allotment.setFlat(flat);
        allotment.setStartDate(request.getMoveInDate() != null ? request.getMoveInDate() : LocalDate.now());
        allotment.setStatus(AllotmentStatus.ACTIVE);
        allotmentRepository.save(allotment);

        // --- Create the Tenant record ---
        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .aadharNumber(request.getAadharNumber())
                .maritalStatus(request.getMaritalStatus())
                .moveInDate(request.getMoveInDate() != null ? request.getMoveInDate() : LocalDate.now())
                .isActive(true)
                .isEmployee(request.getIsEmployee() != null ? request.getIsEmployee() : false)
                .monthlyRent(request.getMonthlyRent())
                .resident(resident)
                .flat(flat)
                .linkedUser(savedTenantUser)
                .build();

        Tenant saved = tenantRepository.save(tenant);
        return toResponse(saved);
    }

    @Override
    public List<TenantResponse> getMyTenants() {
        User resident = userService.getLoggedInUser();
        return tenantRepository.findByResidentId(resident.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void removeTenant(Long tenantId) {
        User resident = userService.getLoggedInUser();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (!tenant.getResident().getId().equals(resident.getId())) {
            throw new RuntimeException("Unauthorized: This tenant does not belong to you.");
        }

        // Deactivate tenant record
        tenant.setIsActive(false);
        tenant.setMoveOutDate(LocalDate.now());
        tenantRepository.save(tenant);

        // Deactivate the tenant's login account and allotment
        if (tenant.getLinkedUser() != null) {
            User linkedUser = tenant.getLinkedUser();
            linkedUser.setStatus(UserStatus.DEACTIVATED);
            userRepository.save(linkedUser);

            allotmentRepository.findByUserIdAndStatus(linkedUser.getId(), AllotmentStatus.ACTIVE)
                    .ifPresent(a -> {
                        a.setStatus(AllotmentStatus.VACATED);
                        a.setEndDate(LocalDate.now());
                        allotmentRepository.save(a);
                    });
        }
    }

    @Override
    public void reactivateTenant(Long tenantId) {
        User resident = userService.getLoggedInUser();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (!tenant.getResident().getId().equals(resident.getId())) {
            throw new RuntimeException("Unauthorized: This tenant does not belong to you.");
        }

        long activeCount = tenantRepository.findByResidentId(resident.getId()).stream()
                .filter(Tenant::getIsActive)
                .count();
        if (activeCount > 0) {
            throw new RuntimeException("You already have an active tenant. Deactivate the current one first.");
        }

        tenant.setIsActive(true);
        tenant.setMoveOutDate(null);
        tenantRepository.save(tenant);

        if (tenant.getLinkedUser() != null) {
            User linkedUser = tenant.getLinkedUser();
            linkedUser.setStatus(UserStatus.APPROVED);
            userRepository.save(linkedUser);

            Allotment allotment = new Allotment();
            allotment.setUser(linkedUser);
            allotment.setFlat(tenant.getFlat());
            allotment.setStartDate(LocalDate.now());
            allotment.setStatus(AllotmentStatus.ACTIVE);
            allotmentRepository.save(allotment);
        }
    }

    private TenantResponse toResponse(Tenant t) {
        String flatNumber = t.getFlat() != null ? t.getFlat().getFlatNumber() : null;
        String blockName = (t.getFlat() != null && t.getFlat().getBlock() != null)
                ? t.getFlat().getBlock().getBlockName()
                : null;
        String loginUsername = t.getLinkedUser() != null ? t.getLinkedUser().getUsername() : null;

        return TenantResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .contactNumber(t.getContactNumber())
                .email(t.getEmail())
                .aadharNumber(t.getAadharNumber())
                .maritalStatus(t.getMaritalStatus())
                .moveInDate(t.getMoveInDate())
                .moveOutDate(t.getMoveOutDate())
                .isActive(t.getIsActive())
                .isEmployee(t.getIsEmployee())
                .monthlyRent(t.getMonthlyRent())
                .flatNumber(flatNumber)
                .blockName(blockName)
                .loginUsername(loginUsername)
                .build();
    }

    @Override
    public List<TenantRentRecordDto> getTenantRentRecords(Long tenantId) {
        User resident = userService.getLoggedInUser();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (!tenant.getResident().getId().equals(resident.getId())) {
            throw new RuntimeException("Unauthorized: This tenant does not belong to you.");
        }

        LocalDate moveIn = tenant.getMoveInDate();
        if (moveIn == null) {
            return List.of();
        }

        LocalDate current = LocalDate.now();
        LocalDate end = tenant.getMoveOutDate() != null ? tenant.getMoveOutDate() : current;

        // start iterating from move_in month
        LocalDate startMonthIter = moveIn.withDayOfMonth(1);
        LocalDate endMonthIter = end.withDayOfMonth(1);

        while (!startMonthIter.isAfter(endMonthIter)) {
            int year = startMonthIter.getYear();
            int month = startMonthIter.getMonthValue();

            TenantRentRecord record = tenantRentRecordRepository.findByTenantIdAndRentYearAndRentMonth(tenantId, year,
                    month);
            if (record == null) {
                record = TenantRentRecord.builder()
                        .tenant(tenant)
                        .rentYear(year)
                        .rentMonth(month)
                        .amount(tenant.getMonthlyRent() == null ? 0.0 : tenant.getMonthlyRent())
                        .isPaid(false)
                        .build();
                tenantRentRecordRepository.save(record);
            }
            startMonthIter = startMonthIter.plusMonths(1);
        }

        return tenantRentRecordRepository.findByTenantIdOrderByRentYearDescRentMonthDesc(tenantId)
                .stream()
                .map(r -> TenantRentRecordDto.builder()
                        .id(r.getId())
                        .tenantId(r.getTenant().getId())
                        .rentYear(r.getRentYear())
                        .rentMonth(r.getRentMonth())
                        .amount(r.getAmount())
                        .isPaid(r.getIsPaid())
                        .build())
                .toList();
    }

    @Override
    public TenantRentRecordDto updateTenantRentRecordStatus(Long recordId, Boolean isPaid) {
        User resident = userService.getLoggedInUser();
        TenantRentRecord record = tenantRentRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Rent record not found"));

        if (!record.getTenant().getResident().getId().equals(resident.getId())) {
            throw new RuntimeException("Unauthorized: This tenant does not belong to you.");
        }

        record.setIsPaid(isPaid);
        TenantRentRecord saved = tenantRentRecordRepository.save(record);

        return TenantRentRecordDto.builder()
                .id(saved.getId())
                .tenantId(saved.getTenant().getId())
                .rentYear(saved.getRentYear())
                .rentMonth(saved.getRentMonth())
                .amount(saved.getAmount())
                .isPaid(saved.getIsPaid())
                .build();
    }
}
