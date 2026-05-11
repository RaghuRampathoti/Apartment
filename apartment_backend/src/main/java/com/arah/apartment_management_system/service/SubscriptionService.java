package com.arah.apartment_management_system.service;

import com.arah.apartment_management_system.dto.subscription.AssignSubscriptionRequest;
import com.arah.apartment_management_system.dto.subscription.SubscriptionResponseDTO;

import java.util.List;

public interface SubscriptionService {
    SubscriptionResponseDTO assignSubscription(AssignSubscriptionRequest request);
    SubscriptionResponseDTO updateSubscription(Long id, AssignSubscriptionRequest request);
    List<SubscriptionResponseDTO> getAllSubscriptions();
    List<SubscriptionResponseDTO> getSubscriptionsByApartment(Long apartmentId);
    SubscriptionResponseDTO getActiveSubscription(Long apartmentId);
    void deleteSubscription(Long subscriptionId);
}
