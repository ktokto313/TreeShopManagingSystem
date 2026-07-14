/*
 * Author: AnhLV
 * Created Date: 2026-06-24
 * Name: ReviewRepository.java
 * Description: Data access interface for review persistence and database operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-12
 */
/*
 * Author: Aiden
 * Created Date: 2026-06-24
 * Name: ReviewRepository.java
 * Description: 
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-28
 */
package swp391.group6.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderDetail_Product_Id(Long id);
    Page<Review> findByOrderDetail_Product_Id(Long id, Pageable pageable);
    Page<Review> findByOrderDetail_Product_IdAndRating(Long id, Short rating, Pageable pageable);
    
    Page<Review> findByOrderDetail_Product_IdAndIsHiddenFalse(Long id, Pageable pageable);
    Page<Review> findByOrderDetail_Product_IdAndRatingAndIsHiddenFalse(Long id, Short rating, Pageable pageable);
    
    boolean existsByOrderDetail_Order_IdAndOrderDetail_Product_Id(Long orderId, Long productId);
    List<Review> findByIsCuratedTrue();
}
