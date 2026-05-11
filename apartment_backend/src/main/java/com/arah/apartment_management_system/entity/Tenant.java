package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contactNumber;

    @Column
    private String email;

    @Column
    private String aadharNumber;

    @Column
    private String maritalStatus;

    @Column
    private LocalDate moveInDate;

    @Column
    private LocalDate moveOutDate;

    @Column
    @Builder.Default
    private Boolean isActive = true;

    @Column
    @Builder.Default
    private Boolean isEmployee = false;

    @Column
    private Double monthlyRent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private User resident;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flat_id", nullable = false)
    private Flat flat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_user_id")
    private User linkedUser;

}
