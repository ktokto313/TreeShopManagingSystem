package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.websocket.server.PathParam;
import org.antlr.v4.runtime.atn.SemanticContext;
import org.springframework.http.HttpRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
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
    public ResponseEntity<List<Order>> getOrders(HttpServletRequest request) {
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        List<Order> orderList = orderService.getOrders(loggedInUser);
        return ResponseEntity.ok(orderList);
    }

    @GetMapping("{id}")
    public ResponseEntity<Order> getOrder(HttpServletRequest request, @PathVariable long id) {
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        Order order = orderService.getOrder(id, loggedInUser);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
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
    public ResponseEntity<Void> changeOrder(@PathVariable long id, @RequestBody Order order) {
        if (!orderService.changeOrder(id, order)) {
            return ResponseEntity.badRequest().build();
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
