package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "client_inquiries")
@Getter
@Setter
public class ClientInquiry {

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

    private Integer numberOfFlats;

    private String city;

    private String plan;

    @Column(nullable = false)
    private String status = "NEW"; // NEW, CONTACTED, RESOLVED

    private LocalDateTime createdAt = LocalDateTime.now();
}
