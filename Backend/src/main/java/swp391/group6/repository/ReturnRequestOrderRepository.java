/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestOrderRepository.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */

package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.Order;

import java.util.List;

public interface ReturnRequestOrderRepository
        extends JpaRepository<Order, Long> {


    @Query(value = """
SELECT *
FROM orders o
WHERE o.customer_id = :customerId
AND o.status::text = 'RECEIVED'
AND o.delivery_date >= NOW() - INTERVAL '7 days'
""",
            nativeQuery = true)
    List<Order> findAvailableOrders(
            @Param("customerId") Long customerId
    );
}