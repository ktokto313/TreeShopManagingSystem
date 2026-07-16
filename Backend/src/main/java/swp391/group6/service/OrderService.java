/*
 * Author: ktokto313
 * Created Date: 2026-06-05
 * Name: OrderService.java
 * Description:
 * Last Change Author: ktokto313
 * Last Change Date: 2026-07-03
 */
package swp391.group6.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.OrderDTO;
import swp391.group6.exception.InvalidStateTransitionException;
import swp391.group6.model.*;
import swp391.group6.model.NotificationType;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.UserRepository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final swp391.group6.repository.ReviewRepository reviewRepository;
    private final NotificationService notificationService; // added for order notification triggers

    public OrderService(OrderRepository orderRepository, UserRepository userRepository,
                        swp391.group6.repository.ReviewRepository reviewRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    @PreAuthorize("isAuthenticated()")
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

    @PreAuthorize("isAuthenticated()")
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

    @PreAuthorize("hasAnyRole('MANAGER')")
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

                // Notify the newly assigned shipper.
                notificationService.notifyUserByTemplate(
                        newShipper.getId(),
                        newShipper.getEmail(),
                        NotificationType.DELIVERY_ASSIGNMENT,
                        "DELIVERY_ASSIGNMENT_SHIPPER",
                        existingOrder.getId()
                );

                return true;
            }
        }
        return false;
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'SHIPPER', 'CUSTOMER')")
    public boolean changeOrderStatus(long id, OrderStatus orderStatus, LoginResponse loginResponse) {
        User user = userRepository.findByEmail(loginResponse.getEmail()).orElse(null);
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return false;
        }
        if (!canAccessAllOrder(loginResponse) && !order.getUser().equals(user) && !order.getShipper().equals(user)) {
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

        if (targetStatus == OrderStatus.ARRIVED) {
            order.setDeliveryDate(new Timestamp(System.currentTimeMillis()));
        }

        order.setStatus(targetStatus);

        if (targetStatus == OrderStatus.DELIVERING) {
            User shipper = order.getShipper();
            if (shipper != null) {
                notificationService.notifyUserByTemplate(
                        shipper.getId(),
                        shipper.getEmail(),
                        NotificationType.DELIVERY_ASSIGNMENT,
                        "DELIVERY_STARTED_SHIPPER",
                        order.getId()
                );
            }
        }

        if (targetStatus == OrderStatus.FAILED || targetStatus == OrderStatus.RETURNING) {
            notificationService.notifyRoleByTemplate(
                    "MANAGER",
                    NotificationType.DELIVERY_EXCEPTION,
                    "DELIVERY_ISSUE_MANAGER",
                    order.getId()
            );
        }

        notifyStatusChange(order, targetStatus);
    }

    // Notify the customer whenever their order's status changes.
    private void notifyStatusChange(Order order, OrderStatus targetStatus) {
        User customer = order.getUser();
        if (customer == null) return;

        if (targetStatus == OrderStatus.ARRIVED) {
            notificationService.notifyUserByTemplate(
                    customer.getId(),
                    customer.getEmail(),
                    NotificationType.DELIVERY_COMPLETED,
                    "ORDER_DELIVERED_CUSTOMER",
                    order.getId()
            );
        } else {
            notificationService.notifyUserByTemplate(
                    customer.getId(),
                    customer.getEmail(),
                    NotificationType.ORDER_STATUS_UPDATE,
                    "ORDER_STATUS_UPDATE_CUSTOMER",
                    order.getId(), targetStatus
            );
        }
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

    public boolean hasReviewed(long orderId, long productId) {
        return reviewRepository.existsByOrderDetail_Order_IdAndOrderDetail_Product_Id(orderId, productId);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByOrderDetail_Product_Id(productId);
    }

    public Page<Review> getProductReviews(Long productId, Short rating, Pageable pageable) {
        if (rating != null) {
            return reviewRepository.findByOrderDetail_Product_IdAndRatingAndIsHiddenFalse(productId, rating, pageable);
        }

        return reviewRepository.findByOrderDetail_Product_IdAndIsHiddenFalse(productId, pageable);
    }
    
    @PreAuthorize("hasAnyRole('MANAGER')")
    public Page<Review> getAllProductReviewsForManager(Long productId, Pageable pageable) {
        return reviewRepository.findByOrderDetail_Product_Id(productId, pageable);
    }
    
    @PreAuthorize("hasAnyRole('MANAGER')")
    public boolean toggleReviewHidden(long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false;
        }

        review.setHidden(!review.isHidden());
        reviewRepository.save(review);
        return true;
    }

    public Review createProductReview(long orderId, long productId, swp391.group6.dto.ReviewRequest request, LoginResponse loginResponse) {
        User user = userRepository.findByEmail(loginResponse.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getUser().getId() != user.getId()) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm của đơn hàng của mình");
        }

        if (order.getStatus() != OrderStatus.RECEIVED) {
            throw new RuntimeException("Order must be RECEIVED to review");
        }

        OrderDetail targetDetail = order.getOrderDetailList().stream()
                .filter(od -> od.getProduct().getId() == productId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order Detail not found for product ID: " + productId));

        // Check if this specific order detail already has a review
        boolean alreadyReviewed = reviewRepository.existsByOrderDetail_Order_IdAndOrderDetail_Product_Id(orderId, productId);

        if (alreadyReviewed) {
            throw new RuntimeException("You have already reviewed this item in this order.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setOrderDetail(targetDetail);
        review.setComment(request.getComment());
        review.setRating((short) request.getRating());
        review.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        review.setCurated(false);

        return reviewRepository.save(review);
    }

    public List<Review> getCuratedReviews() {
        return reviewRepository.findByIsCuratedTrue();
    }

    @PreAuthorize("hasAnyRole('MANAGER')")
    public boolean toggleReviewCurated(long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false;
        }

        review.setCurated(!review.isCurated());
        reviewRepository.save(review);
        return true;
    }
}
