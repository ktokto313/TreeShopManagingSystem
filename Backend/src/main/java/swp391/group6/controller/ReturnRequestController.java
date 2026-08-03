/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestController.java
 * Description: Full return/exchange flow controller
 * Last Change Author: HungDLM
 * Last Change Date: 2026-07-31
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
            IllegalStateException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        ex.getMessage()
                ));
    }


    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAvailableOrders(
            @RequestParam String customerId
    ) {

        return ResponseEntity.ok(
                returnRequestService.getAvailableOrders(customerId)
        );
    }


    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<List<OrderDetail>> getOrderItems(
            @PathVariable String orderId
    ) {

        return ResponseEntity.ok(
                returnRequestService.getOrderItems(orderId)
        );
    }


    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAvailableProducts() {

        return ResponseEntity.ok(
                returnRequestService.getAvailableProducts()
        );
    }


    @PostMapping
    public ResponseEntity<ReturnRequest> createReturnRequest(
            @RequestParam String customerId,
            @RequestBody ReturnRequestDTO request
    ) {

        return ResponseEntity.ok(
                returnRequestService.submitRequest(
                        customerId,
                        request
                )
        );
    }


    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReturnRequest>> getCustomerRequests(
            @PathVariable String customerId
    ) {

        return ResponseEntity.ok(
                returnRequestService.getCustomerRequests(customerId)
        );
    }


    @GetMapping("/customer/{customerId}/approved")
    public ResponseEntity<List<ReturnRequest>> getApprovedRequests(
            @PathVariable String customerId
    ) {

        return ResponseEntity.ok(
                returnRequestService.getApprovedRequests(customerId)
        );
    }


    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReturnRequest> cancelRequest(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.cancelRequest(id)
        );
    }


    @PostMapping("/{id}/mark-returning")
    public ResponseEntity<ReturnRequest> markReturning(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.markReturning(id)
        );
    }


    @PutMapping("/{id}/info")
    public ResponseEntity<ReturnRequest> updateRequestInfo(
            @PathVariable String id,
            @RequestBody ReturnRequestUpdateDTO info
    ) {

        return ResponseEntity.ok(
                returnRequestService.updateRequestInfo(
                        id,
                        info
                )
        );
    }


    @PutMapping("/{id}/refund-info")
    public ResponseEntity<ReturnRequest> submitRefundInfo(
            @PathVariable String id,
            @RequestBody RefundInfoDTO dto
    ) {

        return ResponseEntity.ok(
                returnRequestService.submitBankInfo(
                        id,
                        dto
                )
        );
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ReturnRequest> confirmAdditionalPayment(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.confirmAdditionalPayment(id)
        );
    }


    @GetMapping("/pending")
    public ResponseEntity<List<ReturnRequest>> getPendingRequests() {

        return ResponseEntity.ok(
                returnRequestService.getPendingRequests()
        );
    }


    @GetMapping("/manager/active")
    public ResponseEntity<List<ReturnRequest>> getManagerRequests() {

        return ResponseEntity.ok(
                returnRequestService.getManagerRequests()
        );
    }


    @GetMapping("/manager/report")
    public ResponseEntity<ReturnReportDTO> getReturnReport() {

        return ResponseEntity.ok(
                returnRequestService.getReturnReport()
        );
    }


    @PostMapping("/{id}/request-more-info")
    public ResponseEntity<Void> requestMoreInfo(
            @PathVariable String id
    ) {

        returnRequestService.requestMoreInfo(id);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/{id}/decision")
    public ResponseEntity<ReturnRequest> decideRequest(
            @PathVariable String id,
            @RequestBody FinalDecisionDTO decision
    ) {

        if (decision == null
                ||
                decision.getDecision() == null) {

            throw new IllegalArgumentException(
                    "Quyết định là bắt buộc"
            );
        }

        if (decision.getDecision()
                == FinalDecisionDTO.Decision.DECLINE
                &&
                (decision.getReason() == null
                        ||
                        decision.getReason().isBlank())) {

            throw new IllegalArgumentException(
                    "Lý do từ chối là bắt buộc"
            );
        }

        ReturnRequest updated;


        if (decision.getDecision()
                == FinalDecisionDTO.Decision.APPROVE) {

            updated =
                    returnRequestService.approveRequest(id);

        } else {

            updated =
                    returnRequestService.rejectRequest(
                            id,
                            decision.getReason()
                    );
        }


        return ResponseEntity.ok(updated);
    }


    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<ReturnRequest> confirmReturn(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.confirmReturn(id)
        );
    }

    @PostMapping("/{id}/complete-payment")
    public ResponseEntity<ReturnRequest> completePayment(
            @PathVariable String id
    ) {

        returnRequestService.completePayment(id);

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }


    @PostMapping("/{id}/complete-by-manager")
    public ResponseEntity<ReturnRequest> completeByManager(
            @PathVariable String id
    ) {

        returnRequestService.completeByManager(id);

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequest> getRequestDetail(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }

    @GetMapping("/{id}/price-difference")
    public ResponseEntity<BigDecimal> calculatePriceDifference(
            @PathVariable String id
    ) {

        return ResponseEntity.ok(
                returnRequestService.calculatePriceDifference(id)
        );
    }


    @GetMapping
    public ResponseEntity<List<ReturnRequest>> getAllRequests() {

        return ResponseEntity.ok(
                returnRequestService.getAllRequests()
        );
    }


    @PostMapping("/images/upload")
    public ResponseEntity<Map<String, String>> uploadEvidenceImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File trống"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null
                ||
                !contentType.startsWith("image/")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ chấp nhận file ảnh"
            );
        }
        BlogImage img = new BlogImage();

        img.setImageData(
                file.getBytes()
        );

        img.setFileName(
                file.getOriginalFilename()
        );

        img.setContentType(
                contentType
        );

        img.setImageUrl("");
        BlogImage saved =
                blogImageRepository.save(img);
        String url =
                "/api/blogs/images/" + saved.getId();
        saved.setImageUrl(url);
        blogImageRepository.save(saved);
        return ResponseEntity.ok(
                Map.of(
                        "url",
                        url
                )
        );
    }
}