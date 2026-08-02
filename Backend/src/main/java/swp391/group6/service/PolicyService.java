/*
 * Author: AnhLV
 * Created Date: 2026-07-09
 * Name: PolicyService.java
 * Description: Service layer component handling business logic for policies.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-11
 */
package swp391.group6.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import swp391.group6.model.Policy;
import swp391.group6.model.PolicyStatus;
import swp391.group6.repository.PolicyRepository;

@Service
public class PolicyService {
    private final PolicyRepository policyRepository;

    public PolicyService(PolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public Page<Policy> getAllPolicy(String title, PolicyStatus status, Pageable pageable) {
        if (status == null) {
            if (title == null || title.trim().isEmpty()) {
                return policyRepository.findAll(pageable);
            }
            return policyRepository.findAllByTitleContainingIgnoreCase(title.trim(), pageable);
        } else {
            if (title == null || title.trim().isEmpty()) {
                return policyRepository.findAllByStatus(status, pageable);
            }
            return policyRepository.findAllByTitleContainingIgnoreCaseAndStatus(title.trim(), status, pageable);
        }
    }

    public Policy getPolicyById(Long id, boolean canViewHidden) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chính sách."));
        if (!canViewHidden && policy.getStatus() != PolicyStatus.PUBLISHED) {
            throw new org.springframework.security.access.AccessDeniedException("Chính sách này không khả dụng.");
        }
        return policy;
    }

    public Policy createPolicy(Policy policy) {
        if (policy.getTitle() == null || policy.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề chính sách không được để trống.");
        }
        if (policy.getDescription() == null || policy.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung chính sách không được để trống.");
        }
        if (policyRepository.existsByTitleIgnoreCase(policy.getTitle().trim())) {
            throw new IllegalArgumentException("Tiêu đề chính sách này đã tồn tại. Vui lòng chọn một tên khác.");
        }
        policy.setTitle(policy.getTitle().trim());
        policy.setDescription(policy.getDescription().trim());
        return policyRepository.save(policy);
    }

    public Policy updatePolicy(Long id, Policy policyDetails) {
        Policy policy = getPolicyById(id, true);

        if (policyDetails.getTitle() != null) {
            if (policyDetails.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Tiêu đề chính sách không được để trống.");
            }
            if (policyRepository.existsByTitleIgnoreCaseAndIdNot(policyDetails.getTitle().trim(), id)) {
                throw new IllegalArgumentException("Tiêu đề chính sách này đã tồn tại. Vui lòng chọn một tên khác.");
            }
            policy.setTitle(policyDetails.getTitle().trim());
        }

        if (policyDetails.getDescription() != null) {
            if (policyDetails.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Nội dung chính sách không được để trống.");
            }
            policy.setDescription(policyDetails.getDescription().trim());
        }

        if (policyDetails.getStatus() != null) {
            policy.setStatus(policyDetails.getStatus());
        }
        return policyRepository.save(policy);
    }
}
