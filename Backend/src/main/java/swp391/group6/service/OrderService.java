package swp391.group6.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import swp391.group6.dto.LoginResponse;
import swp391.group6.exception.InvalidStateTransitionException;
import swp391.group6.model.*;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.UserRepository;
import swp391.group6.util.JWTUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<Order> getOrders(LoginResponse loginResponse) {
        if (canAccessAllOrder(loginResponse)) {
            return orderRepository.findAll();
        } else {
            User fullUser = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
            if (fullUser == null) return new ArrayList<>();
            return orderRepository.findOrdersByUser_IdOrShipper_Id(fullUser.getId(), fullUser.getId());
        }
    }

    public Order getOrder(long id, LoginResponse user) {
        Optional<Order> order;
        if (canAccessAllOrder(user)) {
            order = orderRepository.findById(id);
        } else {
            User fullUser = userRepository.findByEmail(user.getEmail()).orElse(null);
            if (fullUser == null) {
                return null;
            }
            order = orderRepository.findOrderByIdAndUser_IdOrShipper_Id(id, fullUser.getId(), fullUser.getId());
        }
        return order.orElse(null);
    }

    public boolean addOrder(ShoppingCart shoppingCart) {

        //TODO placeholder, implement this
        return true;
    }

    public boolean changeOrder(HttpServletRequest request, long id, Order order) {
        //TODO placeholder, implement this
        LoginResponse loginResponse = JWTUtil.getUser(request);
        User user = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
        boolean changed = false;
        if (order.getShipper() != null && user.getRole().getName().equals("SHIPPER") && order.getShipper().equals(user)) {
            order.setShipper(user);
            changed = true;
        }

        if (changed) {
            orderRepository.save(order);
        }

        return changed;
    }

    public boolean changeOrderStatus(long id, OrderStatus orderStatus, LoginResponse loginResponse) {
        User user = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return false;
        }
        if (!canModifyAllOrder(loginResponse)) {
            if (!order.getUser().equals(user) && !order.getShipper().equals(user)) {
                return false;
            }

            try {
                tryToChangeState(order, user, orderStatus);
            } catch (Exception e) {
                return false;
            }
        }

        orderRepository.save(order);
        return true;
    }

    public void tryToChangeState(Order order, User user, OrderStatus targetStatus) {
        OrderStatus currentStatus = order.getStatus();
        String roleName = resolveRoleName(user);

        if (!isTransitionAllowed(currentStatus, targetStatus, roleName)) {
            throw new InvalidStateTransitionException(
                "Cannot transition order from " + currentStatus + " to " + targetStatus
                    + " with role " + roleName);
        }

        order.setStatus(targetStatus);
    }

    private String resolveRoleName(User user) {
        if (user == null || user.getRole() == null || user.getRole().getName() == null) {
            return null;
        }
        return user.getRole().getName().toUpperCase();
    }

    private boolean isTransitionAllowed(
        OrderStatus from, OrderStatus to, String roleName) {
        if (from == null || to == null || roleName == null) {
            return false;
        }

        return switch (from) {
            case PROCESSING -> to == OrderStatus.PENDING && "MANAGER".equals(roleName);
            case PENDING -> to == OrderStatus.DELIVERING && "MANAGER".equals(roleName);
            case DELIVERING ->
                (to == OrderStatus.ARRIVED || to == OrderStatus.FAILED) && "SHIPPER".equals(roleName);
            case ARRIVED -> switch (to) {
                case RECEIVED, RETURN_PENDING -> "CUSTOMER".equals(roleName);
                default -> false;
            };
            case RETURN_PENDING -> to == OrderStatus.RETURNING && "MANAGER".equals(roleName);
            case RETURNING -> to == OrderStatus.FAILED && "SHIPPER".equals(roleName);
            default -> false;
        };
    }

    public boolean canAccessAllOrder(LoginResponse user) {
        return (user.getRole().equals("MANAGER")
            || user.getRole().equals("SYSTEM_ADMIN"));
    }

    public boolean canModifyAllOrder(LoginResponse user) {
        return user.getRole().equals("SYSTEM_ADMIN");
    }
}
