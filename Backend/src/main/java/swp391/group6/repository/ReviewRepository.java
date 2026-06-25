package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByOrderDetail_Product_Id(Long id);
    boolean existsByOrderDetail_Order_IdAndOrderDetail_Product_Id(Long orderId, Long productId);
}
