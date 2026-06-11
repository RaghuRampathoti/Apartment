package com.arah.apartment_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenant_rent_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantRentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private Integer rentYear;

    @Column(nullable = false)
    private Integer rentMonth; 

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Boolean isPaid;

}
