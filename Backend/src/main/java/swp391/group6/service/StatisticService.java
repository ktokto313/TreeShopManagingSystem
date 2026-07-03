/*
 * Author: ktokto313
 * Created Date: 2026-06-26
 * Name: StatisticService.java
 * Description: 
 * Last Change Author: ktokto313
 * Last Change Date: 2026-07-03
 */
package swp391.group6.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import swp391.group6.model.Order;
import swp391.group6.model.OrderDetail;
import swp391.group6.model.OrderStatus;
import swp391.group6.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class StatisticService {

    @Autowired
    private OrderRepository orderRepository;

    @PreAuthorize("hasRole('MANAGER')")
    public BigDecimal getProfit(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findByCreatedAtBetweenAndStatus(startDate, endDate, OrderStatus.RECEIVED);
        
        BigDecimal totalProfit = BigDecimal.ZERO;
        
        for (Order order : orders) {
            BigDecimal itemsTotal = BigDecimal.ZERO;
            if (order.getOrderDetailList() != null) {
                for (OrderDetail item : order.getOrderDetailList()) {
                    BigDecimal quantity = new BigDecimal(item.getQuantity());
                    itemsTotal = itemsTotal.add(item.getPricePaid().multiply(quantity));
                }
            }
            
            BigDecimal orderProfit = itemsTotal.add(order.getShippingFee()).subtract(order.getDiscount());
            if (orderProfit.compareTo(BigDecimal.ZERO) < 0) {
                orderProfit = BigDecimal.ZERO;
            }
            
            totalProfit = totalProfit.add(orderProfit);
        }
        
        return totalProfit;
    }

    public List<swp391.group6.dto.BestSellingProductDTO> getBestSellingProducts(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findBestSellingProducts(startDate, endDate, OrderStatus.RECEIVED);
    }
}
