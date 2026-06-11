package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.dto.subscription.AssignSubscriptionRequest;
import com.arah.apartment_management_system.dto.subscription.SubscriptionResponseDTO;
import com.arah.apartment_management_system.service.SubscriptionService;
import com.arah.apartment_management_system.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /** Super Admin: assign a plan to an apartment */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ApiResponse<SubscriptionResponseDTO> assign(@RequestBody AssignSubscriptionRequest request) {
        return ApiResponse.success("Subscription assigned", subscriptionService.assignSubscription(request));
    }

    /** Super Admin: update an existing subscription */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ApiResponse<SubscriptionResponseDTO> update(
            @PathVariable Long id,
            @RequestBody AssignSubscriptionRequest request) {
        return ApiResponse.success("Subscription updated", subscriptionService.updateSubscription(id, request));
    }

    /** Super Admin: list all subscriptions */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ApiResponse<List<SubscriptionResponseDTO>> getAll() {
        return ApiResponse.success("Subscriptions fetched", subscriptionService.getAllSubscriptions());
    }

    /** Super Admin: subscriptions for a specific apartment */
    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ApiResponse<List<SubscriptionResponseDTO>> getByApartment(@PathVariable Long apartmentId) {
        return ApiResponse.success("Subscriptions fetched", subscriptionService.getSubscriptionsByApartment(apartmentId));
    }

    /** Check active subscription for an apartment (used during login check + frontend gating) */
    @GetMapping("/apartment/{apartmentId}/active")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_RESIDENT', 'ROLE_TENANT')")
    public ApiResponse<SubscriptionResponseDTO> getActive(@PathVariable Long apartmentId) {
        return ApiResponse.success("Active subscription", subscriptionService.getActiveSubscription(apartmentId));
    }

    /** Super Admin: delete a subscription record */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ApiResponse.success("Subscription deleted", null);
    }
}
