package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;
import swp391.group6.model.User;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findOrderByIdAndUser_IdOrShipper_Id(long orderId, long userID, long shipperID);
    boolean existsByShipper_Id(long shipperID);
    List<Order> findByCreatedAtBetweenAndStatus(java.util.Date startDate, java.util.Date endDate, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE (CAST(o.id AS string) LIKE %:query% OR LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Order> searchAll(@Param("query") String query);

    @Query("SELECT o FROM Order o WHERE (CAST(o.id AS string) LIKE %:query% OR LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :query, '%'))) AND (o.user.id = :userId OR o.shipper.id = :shipperId)")
    List<Order> searchByUserIdOrShipperId(
            @Param("query") String query,
            @Param("userId") long userId,
            @Param("shipperId") long shipperId);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses AND (CAST(o.id AS string) LIKE %:query% OR LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Order> searchByStatusIn(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("query") String query);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses AND (CAST(o.id AS string) LIKE %:query% OR LOWER(o.shippingAddress) LIKE LOWER(CONCAT('%', :query, '%'))) AND (o.user.id = :userId OR o.shipper.id = :shipperId)")
    List<Order> searchByStatusInAndUserIdOrShipperId(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("query") String query,
            @Param("userId") long userId,
            @Param("shipperId") long shipperId);
}
