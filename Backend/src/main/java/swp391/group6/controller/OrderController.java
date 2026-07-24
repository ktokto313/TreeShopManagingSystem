/*
 * Author: ktokto313
 * Created Date: 2026-06-05
 * Name: OrderController.java
 * Description: 
 * Last Change Author: ktokto313
 * Last Change Date: 2026-06-30
 */
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
    public ResponseEntity<Page<OrderListDTO>> getOrders(
            HttpServletRequest request,
            @RequestParam(name = "statusList", required = false) List<OrderStatus> statusList,
            @RequestParam(name = "query", required = false) String query,
            @PageableDefault(size = 10) Pageable pageable) {
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        Page<OrderListDTO> orderList = orderService.getOrders(loggedInUser, statusList, query, pageable)
                .map(OrderListDTO::new);
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
        //This is in Checkout controller sadly
        return ResponseEntity.notFound().build();
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
    public ResponseEntity<Void> changeOrderStatus(HttpServletRequest request, @PathVariable long id, @RequestParam(name = "status") OrderStatus orderStatus) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        if (!orderService.changeOrderStatus(id, orderStatus, loginResponse)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }


}
