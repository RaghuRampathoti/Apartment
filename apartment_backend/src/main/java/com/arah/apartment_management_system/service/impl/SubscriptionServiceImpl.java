package com.arah.apartment_management_system.service.impl;

import com.arah.apartment_management_system.dto.subscription.AssignSubscriptionRequest;
import com.arah.apartment_management_system.dto.subscription.SubscriptionResponseDTO;
import com.arah.apartment_management_system.entity.Apartment;
import com.arah.apartment_management_system.entity.ApartmentSubscription;
import com.arah.apartment_management_system.enums.SubscriptionPlan;
import com.arah.apartment_management_system.exception.ResourceNotFoundException;
import com.arah.apartment_management_system.repository.ApartmentRepository;
import com.arah.apartment_management_system.repository.ApartmentSubscriptionRepository;
import com.arah.apartment_management_system.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SubscriptionServiceImpl implements SubscriptionService {

    private final ApartmentSubscriptionRepository subscriptionRepository;
    private final ApartmentRepository apartmentRepository;

    // Canonical plan prices
    private static final Map<SubscriptionPlan, Double> PLAN_PRICES = Map.of(
            SubscriptionPlan.STARTER, 999.0,
            SubscriptionPlan.PROFESSIONAL, 1999.0,
            SubscriptionPlan.ENTERPRISE, 2999.0
    );

    @Override
    public SubscriptionResponseDTO assignSubscription(AssignSubscriptionRequest request) {
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found"));

        double price = PLAN_PRICES.getOrDefault(request.getPlan(), 0.0);

        ApartmentSubscription subscription = ApartmentSubscription.builder()
                .apartment(apartment)
                .plan(request.getPlan())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .pricePaid(price)
                .build();

        ApartmentSubscription saved = subscriptionRepository.save(subscription);
        return toDTO(saved);
    }

    @Override
    public List<SubscriptionResponseDTO> getAllSubscriptions() {
        return subscriptionRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<SubscriptionResponseDTO> getSubscriptionsByApartment(Long apartmentId) {
        return subscriptionRepository.findByApartmentIdOrderByCreatedAtDesc(apartmentId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public SubscriptionResponseDTO getActiveSubscription(Long apartmentId) {
        return subscriptionRepository.findActiveSubscription(apartmentId, LocalDate.now())
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public void deleteSubscription(Long subscriptionId) {
        ApartmentSubscription sub = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        subscriptionRepository.delete(sub);
    }

    @Override
    public SubscriptionResponseDTO updateSubscription(Long id, AssignSubscriptionRequest request) {
        ApartmentSubscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        if (request.getPlan() != null) {
            sub.setPlan(request.getPlan());
            sub.setPricePaid(PLAN_PRICES.getOrDefault(request.getPlan(), sub.getPricePaid()));
        }
        if (request.getStartDate() != null) sub.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)   sub.setEndDate(request.getEndDate());
        return toDTO(subscriptionRepository.save(sub));
    }

    private SubscriptionResponseDTO toDTO(ApartmentSubscription s) {
        return SubscriptionResponseDTO.builder()
                .id(s.getId())
                .apartmentId(s.getApartment().getId())
                .apartmentName(s.getApartment().getName())
                .plan(s.getPlan())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .pricePaid(s.getPricePaid())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
