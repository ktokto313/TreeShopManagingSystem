/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: ShoppingCartRepository.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-20
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ShoppingCart;

import java.util.Optional;

public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findByCustomer_Id(long customerId);
}
