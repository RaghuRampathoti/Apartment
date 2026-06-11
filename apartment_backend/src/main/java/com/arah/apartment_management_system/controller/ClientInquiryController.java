package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.entity.ClientInquiry;
import com.arah.apartment_management_system.repository.ClientInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@SuppressWarnings("null")
public class ClientInquiryController {

    private final ClientInquiryRepository clientInquiryRepository;

    @PostMapping("/api/inquiries")
    public ResponseEntity<?> submitInquiry(@RequestBody ClientInquiry inquiry) {
        clientInquiryRepository.save(inquiry);
        return ResponseEntity.ok().body("{\"message\": \"Inquiry submitted successfully\"}");
    }

    @GetMapping("/api/admin/inquiries")
    public ResponseEntity<List<ClientInquiry>> getAllInquiries() {
        return ResponseEntity.ok(clientInquiryRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/api/admin/inquiries/{id}/status")
    public ResponseEntity<?> updateInquiryStatus(@PathVariable Long id, @RequestParam String status) {
        return clientInquiryRepository.findById(id).map(inquiry -> {
            inquiry.setStatus(status);
            clientInquiryRepository.save(inquiry);
            return ResponseEntity.ok().body("{\"message\": \"Status updated successfully\"}");
        }).orElse(ResponseEntity.notFound().build());
    }
}
