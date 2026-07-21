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
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.CheckoutRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ShippingFeeRequest;
import swp391.group6.dto.ShippingFeeResponse;
import swp391.group6.service.CheckoutService;
import swp391.group6.util.JWTUtil;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private static final Logger log = LoggerFactory.getLogger(CheckoutController.class);
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

    @PostMapping("/shipping-fee")
    public ResponseEntity<?> calculateShippingFee(@RequestBody ShippingFeeRequest shippingFeeRequest) {
        log.info("calculateShippingFee request province={} district={} totalOrderValue={} itemCount={}", shippingFeeRequest.getProvince(), shippingFeeRequest.getDistrict(), shippingFeeRequest.getTotalOrderValue(), shippingFeeRequest.getItemCount());
        BigDecimal fee = checkoutService.resolveShippingFee(null, shippingFeeRequest);
        int feeInt = fee != null ? fee.intValue() : 0;
        log.info("calculateShippingFee response fee={}", feeInt);
        ShippingFeeResponse response = new ShippingFeeResponse();
        response.setShippingFee(feeInt);
        return ResponseEntity.ok(response);
    }
}
