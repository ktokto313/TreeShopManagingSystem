package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            return ResponseEntity.ok(cartService.toDTO(cartService.getOrCreateCart(loginResponse)));
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(HttpServletRequest request, @RequestBody CartItemRequest itemRequest) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            CartDTO cart = cartService.toDTO(cartService.addItem(
                    loginResponse,
                    itemRequest == null ? null : itemRequest.getProductId(),
                    itemRequest == null ? null : itemRequest.getQuantity()));
            return ResponseEntity.ok(cart);
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return error(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<?> updateItem(
            HttpServletRequest request,
            @PathVariable Long productId,
            @RequestBody CartItemRequest itemRequest) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            CartDTO cart = cartService.toDTO(cartService.updateItem(
                    loginResponse,
                    productId,
                    itemRequest == null ? null : itemRequest.getQuantity()));
            return ResponseEntity.ok(cart);
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return error(HttpStatus.BAD_REQUEST, exception.getMessage());
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(HttpServletRequest request, @PathVariable Long productId) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            return ResponseEntity.ok(cartService.toDTO(cartService.removeItem(loginResponse, productId)));
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(HttpServletRequest request) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            return ResponseEntity.ok(cartService.toDTO(cartService.clearCart(loginResponse)));
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        }
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
