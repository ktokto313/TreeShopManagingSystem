/*
 * Author: AnhLV
 * Created Date: 2026-06-24
 * Name: ReviewRepository.java
 * Description: Data access interface for review persistence and database operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-12
 */

package swp391.group6.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductId(Long id, Pageable pageable);

    
    Page<Review> findByProductIdAndIsHiddenFalse(Long id, Pageable pageable);
    Page<Review> findByProductIdAndRatingAndIsHiddenFalse(Long id, Short rating, Pageable pageable);
    
    boolean existsByOrderDetail_Order_IdAndOrderDetail_Product_Id(Long orderId, Long productId);
    List<Review> findByIsCuratedTrue();
}
