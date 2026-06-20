package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swp391.group6.dto.CheckoutRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.service.CheckoutService;
import swp391.group6.util.JWTUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<?> checkout(HttpServletRequest request, @RequestBody CheckoutRequest checkoutRequest) {
        try {
            LoginResponse loginResponse = JWTUtil.getUser(request);
            return ResponseEntity.ok(checkoutService.checkout(loginResponse, checkoutRequest));
        } catch (SecurityException exception) {
            return error(HttpStatus.UNAUTHORIZED, exception.getMessage());
        } catch (IllegalArgumentException exception) {
            return error(HttpStatus.BAD_REQUEST, exception.getMessage());
        } catch (IllegalStateException exception) {
            return error(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
        }
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
