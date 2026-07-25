/*
 * Author: minhlthe200133
 * Created Date: 2026-07-25
 * Name: WishlistItemRepository.java
 * Description: Repository for WishlistItem entity with custom queries for wishlist operations
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.group6.model.WishlistItem;

import java.util.List;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    /**
     * Finds all wishlist items for a specific product.
     * Used to notify customers when a product comes back in stock.
     * 
     * @param productId the product ID to search for
     * @return list of WishlistItems containing the specified product
     */
    List<WishlistItem> findByProduct_Id(Long productId);
}
