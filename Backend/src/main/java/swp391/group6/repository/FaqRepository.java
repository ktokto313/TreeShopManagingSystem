/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: FaqRepository.java
 * Description: Repository for Faq entity
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.group6.model.Faq;
import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findByActiveTrueOrderByDisplayOrderAsc();
}
