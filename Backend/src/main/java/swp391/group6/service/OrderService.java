package swp391.group6.service;

import org.springframework.stereotype.Service;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.OrderDTO;
import swp391.group6.exception.InvalidStateTransitionException;
import swp391.group6.model.*;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.UserRepository;

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

    public List<Order> getOrders(LoginResponse loginResponse, List<OrderStatus> statuses, String query) {
        if (query == null) query = "";
        boolean hasStatusFilter = statuses != null && !statuses.isEmpty();

        if (canAccessAllOrder(loginResponse)) {
            if (hasStatusFilter) {
                return orderRepository.searchByStatusIn(statuses, query);
            } else {
                return orderRepository.searchAll(query);
            }
        } else {
            User fullUser = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
            if (fullUser == null) return new ArrayList<>();
            long uid = fullUser.getId();
            if (hasStatusFilter) {
                return orderRepository.searchByStatusInAndUserIdOrShipperId(statuses, query, uid, uid);
            } else {
                return orderRepository.searchByUserIdOrShipperId(query, uid, uid);
            }
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

    public boolean changeOrder(LoginResponse loginResponse, long id, OrderDTO order) {
        User user = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
        if (user == null || !user.getRole().getName().equals("MANAGER")) {
            return false;
        }
        Order existingOrder = orderRepository.findById(id).orElse(null);
        if (existingOrder == null) {
            return false;
        }
        if (order.getShipperId() > 0) {
            User newShipper = userRepository.findById(order.getShipperId()).orElse(null);
            if (newShipper != null) {
                existingOrder.setShipper(newShipper);
                if (existingOrder.getStatus() == OrderStatus.PROCESSING) {
                    tryToChangeState(existingOrder, user, OrderStatus.PENDING);
                } else if (existingOrder.getStatus() == OrderStatus.RETURN_PROCESSING) {
                    tryToChangeState(existingOrder, user, OrderStatus.RETURN_PENDING);
                }
                orderRepository.save(existingOrder);
                return true;
            }
        }
        return false;
    }

    public boolean changeOrderStatus(long id, OrderStatus orderStatus, LoginResponse loginResponse) {
        User user = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return false;
        }
        if (!canModifyAllOrder(loginResponse) && !order.getUser().equals(user) && !order.getShipper().equals(user)) {
            return false;
        }

        if (order.getUser().equals(user) && orderStatus == OrderStatus.RETURN_PROCESSING) {
            order.setShipper(null);
        }

        tryToChangeState(order, user, orderStatus);

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
        } else if (targetStatus != OrderStatus.RETURN_PROCESSING && order.getShipper() == null) {
            throw new InvalidStateTransitionException(
                "Cannot transition order from " + currentStatus + " to " + targetStatus
                    + " without shipper");
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
                (to == OrderStatus.ARRIVED || to == OrderStatus.RETURNING) && "SHIPPER".equals(roleName);
            case ARRIVED ->
                (to == OrderStatus.RECEIVED || to == OrderStatus.RETURN_PROCESSING) && "CUSTOMER".equals(roleName);
            case RETURN_PROCESSING -> to == OrderStatus.RETURN_PENDING && "MANAGER".equals(roleName);
            case RETURN_PENDING -> to == OrderStatus.RETURNING && "SHIPPER".equals(roleName);
            case RETURNING -> to == OrderStatus.FAILED && "MANAGER".equals(roleName);
            default -> false;
        };
    }

    public boolean canAccessAllOrder(LoginResponse user) {
        return (user.getRole().equals("MANAGER")
            || user.getRole().equals("SYSTEM_ADMIN"));
    }

    public boolean canModifyAllOrder(LoginResponse user) {
        return (user.getRole().equals("MANAGER"));
    }
}
