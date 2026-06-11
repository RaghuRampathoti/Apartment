package com.arah.apartment_management_system.controller;

import com.arah.apartment_management_system.entity.DemoRequest;
import com.arah.apartment_management_system.repository.DemoRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@SuppressWarnings("null")
public class DemoRequestController {

    private final DemoRequestRepository demoRequestRepository;

    @PostMapping("/api/demos")
    public ResponseEntity<?> submitDemoRequest(@RequestBody DemoRequest demoRequest) {
        demoRequestRepository.save(demoRequest);
        return ResponseEntity.ok().body("{\"message\": \"Demo request submitted successfully\"}");
    }

    @GetMapping("/api/admin/demos")
    public ResponseEntity<List<DemoRequest>> getAllDemos() {
        return ResponseEntity.ok(demoRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/api/admin/demos/{id}/status")
    public ResponseEntity<?> updateDemoStatus(@PathVariable Long id, @RequestParam String status) {
        return demoRequestRepository.findById(id).map(demo -> {
            demo.setStatus(status);
            demoRequestRepository.save(demo);
            return ResponseEntity.ok().body("{\"message\": \"Status updated successfully\"}");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/admin/demos/{id}/reschedule")
    public ResponseEntity<?> rescheduleDemo(@PathVariable Long id, @RequestParam String newDateTime) {
        return demoRequestRepository.findById(id).map(demo -> {
            demo.setPreferredDateTime(LocalDateTime.parse(newDateTime));
            demo.setStatus("RESCHEDULED");
            demoRequestRepository.save(demo);
            return ResponseEntity.ok().body("{\"message\": \"Demo rescheduled successfully\"}");
        }).orElse(ResponseEntity.notFound().build());
    }
}
