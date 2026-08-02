/*
 * Author: AnhLV
 * Created Date: 2026-07-21
 * Name: ReviewController.java
 * Description: Controller handling requests for review apis.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-21
 */

package swp391.group6.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Review;
import swp391.group6.service.OrderService;
import swp391.group6.util.JWTUtil;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final OrderService orderService;

    public ReviewController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<swp391.group6.model.Review>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Short rating,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<swp391.group6.model.Review> reviews = orderService.getProductReviews(productId, rating, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Page<swp391.group6.model.Review>> getAllProductReviews(
            @PathVariable Long productId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<swp391.group6.model.Review> reviews = orderService.getAllProductReviewsForManager(productId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/order/{orderId}/product/{productId}")
    public ResponseEntity<Review> createProductReview(
            HttpServletRequest request,
            @PathVariable Long orderId,
            @PathVariable Long productId,
            @RequestBody swp391.group6.dto.ReviewRequest reviewRequest) {
        
        LoginResponse loggedInUser = JWTUtil.getUser(request);
        swp391.group6.model.Review review = orderService.createProductReview(orderId, productId, reviewRequest, loggedInUser);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/curated")
    public ResponseEntity<List<swp391.group6.model.Review>> getCuratedReviews() {
        return ResponseEntity.ok(orderService.getCuratedReviews());
    }

    @PutMapping("/{reviewId}/curate")
    @PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> toggleReviewCurated(
            @PathVariable Long reviewId) {
        orderService.toggleReviewCurated(reviewId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{reviewId}/hide")
    @PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Void> toggleReviewHidden(
            @PathVariable Long reviewId) {
        orderService.toggleReviewHidden(reviewId);
        return ResponseEntity.ok().build();
    }
}
