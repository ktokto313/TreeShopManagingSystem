package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swp391.group6.model.Order;
import swp391.group6.model.User;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findOrdersByUser_IdOrShipper_Id(long userID, long shipperID);
    Optional<Order> findOrderByIdAndUser_IdOrShipper_Id(long orderId, long userID, long shipperID);
    boolean existByShipper_Id(long shipperID);
}
