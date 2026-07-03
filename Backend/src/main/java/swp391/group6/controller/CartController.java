/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: CartController.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-27
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.CartDTO;
import swp391.group6.dto.CartItemRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.service.CartService;
import swp391.group6.util.JWTUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        return ResponseEntity.ok(cartService.toDTO(cartService.getOrCreateCart(loginResponse)));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> addItem(HttpServletRequest request, @RequestBody CartItemRequest itemRequest) {
        if (itemRequest == null || itemRequest.getProductId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product ID is required."));
        }
        LoginResponse loginResponse = JWTUtil.getUser(request);
        CartDTO cart = cartService.toDTO(cartService.addItem(
                loginResponse,
                itemRequest.getProductId(),
                itemRequest.getQuantity()));
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/items/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateItem(
            HttpServletRequest request,
            @PathVariable Long productId,
            @RequestBody CartItemRequest itemRequest) {
        if (itemRequest == null || itemRequest.getQuantity() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Quantity is required."));
        }
        LoginResponse loginResponse = JWTUtil.getUser(request);
        CartDTO cart = cartService.toDTO(cartService.updateItem(
                loginResponse,
                productId,
                itemRequest.getQuantity()));
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> removeItem(HttpServletRequest request, @PathVariable Long productId) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        return ResponseEntity.ok(cartService.toDTO(cartService.removeItem(loginResponse, productId)));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> clearCart(HttpServletRequest request) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        return ResponseEntity.ok(cartService.toDTO(cartService.clearCart(loginResponse)));
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
