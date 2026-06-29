package swp391.group6.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import swp391.group6.model.Order;
import swp391.group6.model.OrderDetail;
import swp391.group6.model.OrderStatus;
import swp391.group6.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
public class StatisticService {

    @Autowired
    private OrderRepository orderRepository;

    // @PreAuthorize("hasAuthority('MANAGER')")
    public BigDecimal getProfit(Date startDate, Date endDate) {
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
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
}
