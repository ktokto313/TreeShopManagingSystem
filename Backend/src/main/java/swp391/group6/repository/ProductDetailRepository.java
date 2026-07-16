/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-03
 * Last Modified: 2026-07-03
 */
/*
 * Author: minhlthe200133
 * Created Date: 2026-06-03
 * Name: ProductDetailRepository.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-07
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ProductDetail;

import java.util.Optional;

public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {
    Optional<ProductDetail> findByProduct_Id(Long productId);
}
