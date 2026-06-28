package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.java.Log;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.OrderDTO;
import swp391.group6.dto.OrderListDTO;
import swp391.group6.exception.InvalidStateTransitionException;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.User;
import swp391.group6.service.OrderService;
import swp391.group6.util.JWTUtil;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderListDTO>> getOrders(
            HttpServletRequest request,
            @RequestParam(name = "statusList", required = false) List<OrderStatus> statusList,
            @RequestParam(name = "query", required = false) String query) {
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        List<OrderListDTO> orderList = orderService.getOrders(loggedInUser, statusList, query)
                .stream()
                .map(OrderListDTO::new)
                .toList();
        return ResponseEntity.ok(orderList);
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderDTO> getOrder(HttpServletRequest request, @PathVariable long id) {
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        Order order = orderService.getOrder(id, loggedInUser);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        OrderDTO orderDTO = new OrderDTO(order);
        List<swp391.group6.dto.OrderDetailDTO> detailDTOs = order.getOrderDetailList().stream().map(od -> {
            boolean hasReviewed = orderService.hasReviewed(od.getOrder().getId(), od.getProduct().getId());
            return new swp391.group6.dto.OrderDetailDTO(od, hasReviewed);
        }).toList();
        orderDTO.setOrderDetailList(detailDTOs);

        return ResponseEntity.ok(orderDTO);
    }

    @PostMapping
    public ResponseEntity<Void> addOrder(@RequestBody ShoppingCart shoppingCart) {
        if (orderService.addOrder(shoppingCart)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<Void> changeOrder(HttpServletRequest request, @PathVariable long id, @RequestBody OrderDTO order) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        try {
            if (!orderService.changeOrder(loginResponse, id, order)) {
                return ResponseEntity.badRequest().build();
            }
        } catch (InvalidStateTransitionException e) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok().build();
    }

    @PutMapping("{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'SHIPPER')")
    public ResponseEntity<Void> changeOrderStatus(HttpServletRequest request, @PathVariable long id, @RequestParam(name = "status") OrderStatus orderStatus) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        if (!orderService.changeOrderStatus(id, orderStatus, loginResponse)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<swp391.group6.model.Review>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Short rating,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        System.out.println(rating);
        Page<swp391.group6.model.Review> reviews = orderService.getProductReviews(productId, rating, pageable);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/{orderId}/details/{productId}/review")
    public ResponseEntity<?> createProductReview(
            HttpServletRequest request,
            @PathVariable Long orderId,
            @PathVariable Long productId,
            @RequestBody swp391.group6.dto.ReviewRequest reviewRequest) {
        
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        try {
            swp391.group6.model.Review review = orderService.createProductReview(orderId, productId, reviewRequest, loggedInUser);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
