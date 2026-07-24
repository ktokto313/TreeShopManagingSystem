/*
 * Author: ktokto313
 * Created Date: 2026-06-05
 * Name: OrderRepository.java
 * Description: 
 * Last Change Author: ktokto313
 * Last Change Date: 2026-07-03
 */
package swp391.group6.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE (CAST(o.id AS string) = :orderId) AND ((CAST(o.user.id AS string) = :userID) OR (CAST(o.shipper.id AS string) = :shipperID))")
    Optional<Order> findOrderByIdAndUser_IdOrShipper_Id(long orderId, long userID, long shipperID);
    boolean existsByShipper_Id(long shipperID);
    
    @Query("SELECT o FROM Order o JOIN o.orderDetailList od WHERE o.user.id = :userId AND od.product.id = :productId")
    List<Order> findOrdersByUserAndProduct(@Param("userId") long userId, @Param("productId") long productId);

    List<Order> findByCreatedAtBetweenAndStatus(LocalDateTime startDate, LocalDateTime endDate, OrderStatus status);

    List<Order> findByStatus(OrderStatus status);

    //TODO: those 4 methods are using native PostGreSQL query because I need the order_status cast to work to sort
    @Query(value = "SELECT * " +
            "FROM orders o " +
            "WHERE (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY o.status::order_status asc, o.created_at desc", 
           countQuery = "SELECT count(*) FROM orders o WHERE (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%')))",
           nativeQuery = true)
    Page<Order> searchAllOrderByStatusAscThenCreatedAtDesc(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT * " +
            "FROM orders o " +
            "WHERE (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (o.customer_id = :userId OR o.shipper_id = :shipperId) " +
            "ORDER BY o.status::order_status asc, o.created_at desc", 
           countQuery = "SELECT count(*) FROM orders o WHERE (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) AND (o.customer_id = :userId OR o.shipper_id = :shipperId)",
           nativeQuery = true)
    Page<Order> searchByUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc(
            @Param("query") String query,
            @Param("userId") long userId,
            @Param("shipperId") long shipperId, Pageable pageable);

    @Query(value = "SELECT * " +
            "FROM orders o " +
            "WHERE o.status::TEXT IN :statuses " +
            "AND (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY o.status::order_status asc, o.created_at desc", 
           countQuery = "SELECT count(*) FROM orders o WHERE o.status::TEXT IN :statuses AND (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%')))",
           nativeQuery = true)
    Page<Order> searchByStatusInOrderByStatusAscThenCreatedAtDesc(
            @Param("statuses") List<String> statuses,
            @Param("query") String query, Pageable pageable);

    @Query(value = "SELECT * " +
            "FROM orders o " +
            "WHERE o.status::TEXT IN :statuses " +
            "   AND (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "   AND (o.customer_id = :userId OR o.shipper_id = :shipperId) " +
            "ORDER BY o.status::order_status asc, o.created_at desc", 
           countQuery = "SELECT count(*) FROM orders o WHERE o.status::TEXT IN :statuses AND (o.id::TEXT LIKE %:query% OR LOWER(o.shipping_address) LIKE LOWER(CONCAT('%', :query, '%'))) AND (o.customer_id = :userId OR o.shipper_id = :shipperId)",
           nativeQuery = true)
    Page<Order> searchByStatusInAndUserIdOrShipperIdOrderByStatusAscThenCreatedAtDesc(
            @Param("statuses") List<String> statuses,
            @Param("query") String query,
            @Param("userId") long userId,
            @Param("shipperId") long shipperId, Pageable pageable);

    @Query("SELECT p.id AS productId, p.name AS productName, CAST(SUM(od.quantity) AS int) AS totalSold " +
           "FROM Order o JOIN o.orderDetailList od JOIN od.product p " +
           "WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.status = :status " +
           "GROUP BY p.id, p.name " +
           "ORDER BY SUM(od.quantity) DESC")
    List<swp391.group6.dto.BestSellingProductDTO> findBestSellingProducts(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("status") OrderStatus status);
}
