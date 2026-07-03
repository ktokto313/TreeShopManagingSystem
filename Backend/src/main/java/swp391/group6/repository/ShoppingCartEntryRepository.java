/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: ShoppingCartEntryRepository.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-20
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.ShoppingCartEntryId;

public interface ShoppingCartEntryRepository extends JpaRepository<ShoppingCartEntry, ShoppingCartEntryId> {
}
