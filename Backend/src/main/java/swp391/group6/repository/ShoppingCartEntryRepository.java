package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.ShoppingCartEntryId;

public interface ShoppingCartEntryRepository extends JpaRepository<ShoppingCartEntry, ShoppingCartEntryId> {
}
