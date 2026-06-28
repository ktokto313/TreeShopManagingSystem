package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ProductResponse;
import swp391.group6.dto.WishlistCheckResponse;
import swp391.group6.service.WishlistService;
import swp391.group6.util.JWTUtil;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> listWishlist(HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (!isCustomer(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(wishlistService.listProducts(currentUser.getEmail()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ProductResponse> addToWishlist(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (!isCustomer(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return wishlistService.addProduct(currentUser.getEmail(), productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<WishlistCheckResponse> checkWishlist(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (!isCustomer(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        boolean wishlisted = wishlistService.isWishlisted(currentUser.getEmail(), productId);
        return ResponseEntity.ok(new WishlistCheckResponse(wishlisted));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (!isCustomer(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        wishlistService.removeProduct(currentUser.getEmail(), productId);
        return ResponseEntity.noContent().build();
    }

    private boolean isCustomer(LoginResponse currentUser) {
        return currentUser != null && "CUSTOMER".equalsIgnoreCase(currentUser.getRole());
    }
}
