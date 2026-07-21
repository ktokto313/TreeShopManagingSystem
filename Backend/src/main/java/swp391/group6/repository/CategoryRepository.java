/*
 * Author: minhlthe200133
 * Created Date: 2026-05-30
 * Name: CategoryRepository.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-07-03
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
