/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: CheckoutController.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-28
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.CheckoutRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.service.CheckoutService;
import swp391.group6.util.JWTUtil;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> checkout(HttpServletRequest request, @RequestBody CheckoutRequest checkoutRequest) {
        LoginResponse loginResponse = JWTUtil.getUser(request);
        return ResponseEntity.ok(checkoutService.checkout(loginResponse, checkoutRequest));
    }
}
