package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ShoppingCart;

import java.util.Optional;

public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findByCustomer_Id(long customerId);
}
