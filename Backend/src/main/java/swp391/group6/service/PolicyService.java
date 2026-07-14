/*
 * Author: AnhLV
 * Created Date: 2026-07-09
 * Name: PolicyService.java
 * Description: Service layer component handling business logic for policies.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-11
 */
package swp391.group6.service;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import swp391.group6.model.Policy;
import swp391.group6.model.PolicyStatus;
import swp391.group6.repository.PolicyRepository;

import java.util.List;

@Service
public class PolicyService {
    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public List<Policy> getAllPolicy(String title, PolicyStatus status, Pageable pageable) {
        if (status == null) {
            if (title == null || title.trim().isEmpty()) {
                return policyRepository.findAll(pageable).getContent();
            }
            return policyRepository.findAllByTitleContainingIgnoreCase(title.trim(), pageable);
        } else {
            if (title == null || title.trim().isEmpty()) {
                return policyRepository.findAllByStatus(status, pageable);
            }
            return policyRepository.findAllByTitleContainingIgnoreCaseAndStatus(title.trim(), status, pageable);
        }
    }

    public Policy getPolicyById(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
    }

    public Policy createPolicy(Policy policy) {
        if (policyRepository.existsByTitleIgnoreCase(policy.getTitle())) {
            throw new IllegalArgumentException("Tiêu đề chính sách này đã tồn tại. Vui lòng chọn một tên khác.");
        }
        return policyRepository.save(policy);
    }

    public Policy updatePolicy(Long id, Policy policyDetails) {
        if (policyDetails.getTitle() != null && policyRepository.existsByTitleIgnoreCaseAndIdNot(policyDetails.getTitle(), id)) {
            throw new IllegalArgumentException("Tiêu đề chính sách này đã tồn tại. Vui lòng chọn một tên khác.");
        }
        Policy policy = getPolicyById(id);
        policy.setTitle(policyDetails.getTitle());
        policy.setDescription(policyDetails.getDescription());
        if (policyDetails.getStatus() != null) {
            policy.setStatus(policyDetails.getStatus());
        }
        return policyRepository.save(policy);
    }

    public void deletePolicy(Long id) {
        Policy policy = getPolicyById(id);
        policyRepository.delete(policy);
    }
}
