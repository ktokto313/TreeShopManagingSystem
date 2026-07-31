package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.ReturnRequest;
import swp391.group6.model.ReturnStatus;

import java.math.BigDecimal;
import java.util.List;

public interface ReturnRequestRepository
        extends JpaRepository<ReturnRequest, String> {


    List<ReturnRequest> findByStatus(
            ReturnStatus status
    );


    List<ReturnRequest> findByCustomer_Id(
            Long customerId
    );


    List<ReturnRequest> findByCustomer_IdAndStatus(
            Long customerId,
            ReturnStatus status
    );


    List<ReturnRequest> findByStatusIn(
            List<ReturnStatus> statuses
    );


    long countByStatus(
            ReturnStatus status
    );

    boolean existsByOrder_IdAndStatusNotIn(
            Long orderId,
            List<ReturnStatus> statuses
    );

    @Query("""
        SELECT COUNT(i) > 0
        FROM ReturnRequestItem i
        JOIN i.returnRequest r
        WHERE r.order.id = :orderId
        AND i.orderDetail.id.productId = :productId
        AND r.status = swp391.group6.model.ReturnStatus.COMPLETED
    """)
    boolean existsCompletedReturnForProduct(
            @Param("orderId") Long orderId,
            @Param("productId") Long productId
    );

    @Query("""
        SELECT COALESCE(SUM(i.quantity),0)
        FROM ReturnRequestItem i
        JOIN i.returnRequest r
        WHERE r.order.id = :orderId
        AND i.orderDetail.id.productId = :productId
        AND r.status = swp391.group6.model.ReturnStatus.COMPLETED
    """)
    Integer sumCompletedReturnQuantity(
            @Param("orderId") Long orderId,
            @Param("productId") Long productId
    );

    @Query("""
        SELECT COUNT(i) > 0
        FROM ReturnRequestItem i
        JOIN i.returnRequest r
        WHERE r.order.id = :orderId
        AND i.orderDetail.id.productId = :productId
        AND r.status NOT IN :statuses
    """)
    boolean existsActiveReturnForProduct(
            @Param("orderId") Long orderId,
            @Param("productId") Long productId,
            @Param("statuses") List<ReturnStatus> statuses
    );


    @Query("""
        SELECT COALESCE(SUM(r.refundAmount), 0)
        FROM ReturnRequest r
        WHERE r.status = :status
    """)
    BigDecimal sumRefundAmountByStatus(
            @Param("status") ReturnStatus status
    );


    @Query("""
        SELECT COALESCE(SUM(r.additionalPayment), 0)
        FROM ReturnRequest r
        WHERE r.status = :status
    """)
    BigDecimal sumAdditionalPaymentByStatus(
            @Param("status") ReturnStatus status
    );

}