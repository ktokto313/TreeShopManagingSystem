package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.websocket.server.PathParam;
import lombok.extern.java.Log;
import org.antlr.v4.runtime.atn.SemanticContext;
import org.springframework.http.HttpRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
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

        return ResponseEntity.ok(new OrderDTO(order));
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
    public ResponseEntity<Void> changeOrderStatus(HttpServletRequest request, @PathVariable long id, @RequestParam(name = "status") OrderStatus orderStatus) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        if (!orderService.changeOrderStatus(id, orderStatus, loginResponse)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }
}
