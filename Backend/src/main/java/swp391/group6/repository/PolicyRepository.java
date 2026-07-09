package swp391.group6.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Policy;
import swp391.group6.model.PolicyStatus;
import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findAllByTitleContainingIgnoreCase(String title, Pageable pageable);
    List<Policy> findAllByStatus(PolicyStatus status, Pageable pageable);
    List<Policy> findAllByTitleContainingIgnoreCaseAndStatus(String title, PolicyStatus status, Pageable pageable);
}
