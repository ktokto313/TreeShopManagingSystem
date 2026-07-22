/*
 * Author: AnhLV
 * Created Date: 2026-07-09
 * Name: PolicyController.java
 * Description: REST controller handling HTTP requests and routing for policy-related operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-09
 */
package swp391.group6.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.model.Policy;
import swp391.group6.model.PolicyStatus;
import swp391.group6.service.PolicyService;

@RestController
@RequestMapping("/api/policy")
public class PolicyController {
    private final PolicyService policyService;

    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public ResponseEntity<Page<Policy>> getAllPolicy(
            @RequestParam(name = "title", required = false) String title,
            @RequestParam(name = "status", required = false) PolicyStatus status,
            @PageableDefault(size = 6, sort = "createdAt") Pageable pageable) {
        Page<Policy> policies = policyService.getAllPolicy(title, status, pageable);
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Policy> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Policy> createPolicy(@RequestBody Policy policy) {
        return ResponseEntity.ok(policyService.createPolicy(policy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Policy> updatePolicy(@PathVariable Long id, @RequestBody Policy policyDetails) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policyDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}
