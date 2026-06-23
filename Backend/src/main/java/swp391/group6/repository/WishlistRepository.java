package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.WishlistItem;
import swp391.group6.model.WishlistItemId;

import java.util.List;

public interface WishlistRepository extends JpaRepository<WishlistItem, WishlistItemId> {
    List<WishlistItem> findByCustomer_IdOrderByProduct_IdAsc(Long customerId);

    boolean existsByCustomer_IdAndProduct_Id(Long customerId, Long productId);

    void deleteByCustomer_IdAndProduct_Id(Long customerId, Long productId);
}
