package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "demo_requests")
@Getter
@Setter
public class DemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String apartmentName;

    private Integer flatsCount;

    @Column(nullable = false)
    private LocalDateTime preferredDateTime;

    @Column(nullable = false)
    private String status = "NEW"; // NEW, SCHEDULED, RESCHEDULED, CANCELLED, COMPLETED

    private LocalDateTime createdAt = LocalDateTime.now();
}
