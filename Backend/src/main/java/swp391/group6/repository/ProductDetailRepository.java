package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ProductDetail;

import java.util.Optional;

public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {
    Optional<ProductDetail> findByProduct_Id(Long productId);
}
