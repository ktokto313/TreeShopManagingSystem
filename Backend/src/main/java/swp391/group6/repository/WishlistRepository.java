/*
 * Author: minhlthe200133
 * Created Date: 2026-06-23
 * Name: WishlistRepository.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-23
 */
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
