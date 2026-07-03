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

    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.DAYS)
    @Transactional
    public void setArrivedOrderStatus() {
        List<Order> orderList = orderRepository.findByStatus(OrderStatus.ARRIVED);
        long threeDaysInMillis = TimeUnit.DAYS.toMillis(3);
        long currentTime = System.currentTimeMillis();
        for (Order order : orderList) {
            if (order.getDeliveryDate() != null && (currentTime - order.getDeliveryDate().getTime() >= threeDaysInMillis)) {
                order.setStatus(OrderStatus.RECEIVED);
                orderRepository.save(order);
            }
        }
    }
}
