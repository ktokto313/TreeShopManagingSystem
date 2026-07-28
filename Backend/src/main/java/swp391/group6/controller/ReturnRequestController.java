/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestController.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-27
 */
package swp391.group6.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import swp391.group6.dto.*;
import swp391.group6.model.*;
import swp391.group6.repository.BlogImageRepository;
import swp391.group6.service.ReturnRequestService;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/return-requests")
public class ReturnRequestController {

    @Autowired
    private ReturnRequestService returnRequestService;

    @Autowired
    private BlogImageRepository blogImageRepository;


    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(
            IllegalStateException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }


    // Customer gets orders that can be returned/exchanged
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAvailableOrders(
            @RequestParam String customerId) {

        return ResponseEntity.ok(
                returnRequestService.getAvailableOrders(customerId)
        );
    }


    // Customer selects an order and gets its items
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<List<OrderDetail>> getOrderItems(
            @PathVariable String orderId) {

        return ResponseEntity.ok(
                returnRequestService.getOrderItems(orderId)
        );
    }


    // Customer selects exchange product
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAvailableProducts() {

        return ResponseEntity.ok(
                returnRequestService.getAvailableProducts()
        );
    }


    // Customer submits a new return/exchange request
    @PostMapping
    public ResponseEntity<ReturnRequest> createReturnRequest(
            @RequestParam String customerId,
            @RequestBody ReturnRequestDTO request) {

        return ResponseEntity.ok(
                returnRequestService.submitRequest(
                        customerId,
                        request
                )
        );
    }


    // Manager opens pending requests
    @GetMapping("/pending")
    public ResponseEntity<List<ReturnRequest>> getPendingRequests() {

        return ResponseEntity.ok(
                returnRequestService.getPendingRequests()
        );
    }


    // Get request detail
    @GetMapping("/detail/{id}")
    public ResponseEntity<ReturnRequest> getRequestDetail(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }


    // Manager requests more information
    @PostMapping("/{id}/request-more-info")
    public ResponseEntity<Void> requestMoreInfo(
            @PathVariable String id) {

        returnRequestService.requestMoreInfo(id);

        return ResponseEntity.ok().build();
    }


    // Customer submits additional information
    @PutMapping("/{id}/info")
    public ResponseEntity<ReturnRequest> updateRequestInfo(
            @PathVariable String id,
            @RequestBody ReturnRequestUpdateDTO info) {

        return ResponseEntity.ok(
                returnRequestService.updateRequestInfo(id, info)
        );
    }


    // Manager approve/reject decision
    @PostMapping("/{id}/decision")
    public ResponseEntity<ReturnRequest> decideRequest(
            @PathVariable String id,
            @RequestBody FinalDecisionDTO decision) {

        if (decision.getDecision() == null) {
            throw new IllegalArgumentException(
                    "Quyết định là bắt buộc"
            );
        }

        ReturnRequest updated;

        if (decision.getDecision()
                == FinalDecisionDTO.Decision.APPROVE) {

            updated = returnRequestService.approveRequest(id);

        } else {

            updated = returnRequestService.rejectRequest(
                    id,
                    decision.getReason()
            );
        }

        return ResponseEntity.ok(updated);
    }


    // Customer cancels pending request
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReturnRequest> cancelRequest(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.cancelRequest(id)
        );
    }


    // Customer confirms returning item
    @PostMapping("/{id}/return")
    public ResponseEntity<ReturnRequest> markReturning(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.markReturning(id)
        );
    }


    // Manager confirms returned item
    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<ReturnRequest> confirmReturn(
            @PathVariable String id) {

        ReturnRequest updated =
                returnRequestService.confirmReturn(id);

        if (updated.getReturnType()
                == ReturnType.EXCHANGE) {

            returnRequestService.calculatePriceDifference(id);
        }

        return ResponseEntity.ok(updated);
    }


    // Manager processes refund/payment
    @PostMapping("/{id}/complete-payment")
    public ResponseEntity<ReturnRequest> completePayment(
            @PathVariable String id) {

        returnRequestService.completePayment(id);

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }


    // Customer confirms additional payment
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ReturnRequest> confirmAdditionalPayment(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.confirmAdditionalPayment(id)
        );
    }


    // Calculate exchange price difference
    @GetMapping("/{id}/price-difference")
    public ResponseEntity<BigDecimal> calculatePriceDifference(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.calculatePriceDifference(id)
        );
    }


    // Customer request history
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReturnRequest>> getCustomerRequests(
            @PathVariable String customerId) {

        return ResponseEntity.ok(
                returnRequestService.getCustomerRequests(customerId)
        );
    }


    // Manager report
    @GetMapping("/manager/report")
    public ReturnReportDTO getReturnReport() {

        return returnRequestService.getReturnReport();
    }


    // Approved requests for customer
    @GetMapping("/customer/{customerId}/approved")
    public ResponseEntity<List<ReturnRequest>> getApprovedRequests(
            @PathVariable String customerId) {

        return ResponseEntity.ok(
                returnRequestService.getApprovedRequests(customerId)
        );
    }

    // All requests
    @GetMapping
    public ResponseEntity<List<ReturnRequest>> getAllRequests() {

        return ResponseEntity.ok(
                returnRequestService.getAllRequests()
        );
    }


    // Submit refund bank information
    @PutMapping("/{id}/refund-info")
    public ResponseEntity<ReturnRequest> submitRefundInfo(
            @PathVariable String id,
            @RequestBody RefundInfoDTO dto) {

        return ResponseEntity.ok(
                returnRequestService.submitRefundInfo(id, dto)
        );
    }


    // Manager completes request
    @PostMapping("/{id}/complete-by-manager")
    public ResponseEntity<Void> completeByManager(
            @PathVariable String id) {

        returnRequestService.completeByManager(id);

        return ResponseEntity.ok().build();
    }


    // Manager active requests
    @GetMapping("/manager/active")
    public ResponseEntity<List<ReturnRequest>> getManagerRequests() {

        return ResponseEntity.ok(
                returnRequestService.getManagerRequests()
        );
    }

    // Upload evidence image
    @PostMapping("/images/upload")
    public ResponseEntity<Map<String, String>> uploadEvidenceImage(
            @RequestParam("file") MultipartFile file)
            throws IOException {

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File trống"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                || !contentType.startsWith("image/")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ chấp nhận file ảnh"
            );
        }


        BlogImage img = new BlogImage();

        img.setImageData(file.getBytes());
        img.setFileName(file.getOriginalFilename());
        img.setContentType(contentType);
        img.setImageUrl("");


        BlogImage saved =
                blogImageRepository.save(img);


        String url =
                "/api/blogs/images/" + saved.getId();


        saved.setImageUrl(url);

        blogImageRepository.save(saved);


        return ResponseEntity.ok(
                Map.of("url", url)
        );
    }
}