/*
 * Author: AnhLV
 * Created Date: 2026-07-09
 * Name: PolicyRepository.java
 * Description: Data access interface for policy persistence and database operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-11
 */
package swp391.group6.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Policy;
import swp391.group6.model.PolicyStatus;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Page<Policy> findAllByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Policy> findAllByStatus(PolicyStatus status, Pageable pageable);
    Page<Policy> findAllByTitleContainingIgnoreCaseAndStatus(String title, PolicyStatus status, Pageable pageable);
    boolean existsByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
