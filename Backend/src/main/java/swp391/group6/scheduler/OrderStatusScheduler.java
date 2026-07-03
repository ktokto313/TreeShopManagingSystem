package swp391.group6.scheduler;

import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;
import swp391.group6.repository.OrderRepository;
import swp391.group6.service.OrderService;

import java.util.List;
import java.util.concurrent.TimeUnit;

public class OrderStatusScheduler {
    OrderRepository orderRepository;

    public OrderStatusScheduler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Scheduled(fixedDelay = 3, timeUnit = TimeUnit.DAYS)
    @Transactional
    public void setArrivedOrderStatus() {
        List<Order> orderList = orderRepository.findByStatus(OrderStatus.ARRIVED);
        for (Order order : orderList) {
        }
    }
}
