/*
 * Author: minhlthe200133
 * Created Date: 2026-05-30
 * Name: ProductRepository.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-12
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    boolean existsByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);
}
