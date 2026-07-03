/*
 * Author: Hung Dao
 * Created Date: 2026-06-03
 * Name: RoleRepository.java
 * Description: 
 * Last Change Author: ktokto313
 * Last Change Date: 2026-06-07
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    Optional<Role> findByNameIgnoreCase(String name);
}
