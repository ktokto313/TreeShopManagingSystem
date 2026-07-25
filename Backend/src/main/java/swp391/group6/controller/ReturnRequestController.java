/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestController.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.*;
import swp391.group6.model.*;
import swp391.group6.service.ReturnRequestService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/return-requests")
public class ReturnRequestController {

    @Autowired
    private ReturnRequestService returnRequestService;

    // Step: Customer submits a new return/exchange request.
    @PostMapping
    public ResponseEntity<ReturnRequest> createReturnRequest(
            @RequestParam String customerId,
            @RequestBody ReturnRequestDTO request) {

        ReturnRequest created =
                returnRequestService.submitRequest(customerId, request);

        return ResponseEntity.ok(created);
    }

    // Step: Manager opens the list of pending requests.
    @GetMapping("/pending")
    public ResponseEntity<List<ReturnRequest>> getPendingRequests(){
        var data = returnRequestService.getPendingRequests();
        return ResponseEntity.ok(data);
    }

    // Step: Manager (or Customer) views a request's detail.
    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequest> getRequestDetail(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }

    // Step: Manager requests more info from Customer.
    @PostMapping("/{id}/request-more-info")
    public ResponseEntity<Void> requestMoreInfo(
            @PathVariable String id) {

        returnRequestService.requestMoreInfo(id);

        return ResponseEntity.ok().build();
    }

    // Step: Customer provides additional information.
    @PutMapping("/{id}/info")
    public ResponseEntity<ReturnRequest> updateRequestInfo(
            @PathVariable String id,
            @RequestBody ReturnRequestUpdateDTO info) {

        return ResponseEntity.ok(
                returnRequestService.updateRequestInfo(id, info)
        );
    }

    // Step: Manager makes final decision.
    @PostMapping("/{id}/decision")
    public ResponseEntity<ReturnRequest> decideRequest(
            @PathVariable String id,
            @RequestBody FinalDecisionDTO decision) {

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

    // Step: Customer confirms returning item.
    @PostMapping("/{id}/return")
    public ResponseEntity<ReturnRequest> markReturning(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.markReturning(id)
        );
    }

    // Step: Manager confirms received item.
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

    // Step: Manager processes payment/refund after receiving item (RECEIVED -> PROCESSING).
    @PostMapping("/{id}/complete-payment")
    public ResponseEntity<ReturnRequest> completePayment(
            @PathVariable String id) {

        returnRequestService.completePayment(id);

        return ResponseEntity.ok(
                returnRequestService.getRequestDetail(id)
        );
    }

    // Step: Customer confirms they have paid the additional amount for an exchange.
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<ReturnRequest> confirmAdditionalPayment(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.confirmAdditionalPayment(id)
        );
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

    // Calculate additional payment/refund difference for exchange
    @GetMapping("/{id}/price-difference")
    public ResponseEntity<BigDecimal> calculatePriceDifference(
            @PathVariable String id) {

        return ResponseEntity.ok(
                returnRequestService.calculatePriceDifference(id)
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReturnRequest>> getCustomerRequests(
            @PathVariable String customerId
    ){

        var data =
                returnRequestService.getCustomerRequests(customerId);

        System.out.println(
                "CUSTOMER RETURN SIZE = " + data.size()
        );

        return ResponseEntity.ok(data);
    }

    @GetMapping("/manager/report")
    public ReturnReportDTO getReturnReport(){

        return returnRequestService
                .getReturnReport();

    }

    @GetMapping("/customer/{customerId}/approved")
    public ResponseEntity<List<ReturnRequest>> getApprovedRequests(
            @PathVariable String customerId
    ) {

        return ResponseEntity.ok(
                returnRequestService.getApprovedRequests(customerId)
        );
    }

    @GetMapping
    public ResponseEntity<List<ReturnRequest>> getAllRequests(){
        return ResponseEntity.ok(
                returnRequestService.getAllRequests()
        );
    }

    @PutMapping("/{id}/refund-info")
    public ResponseEntity<ReturnRequest> submitRefundInfo(
            @PathVariable String id,
            @RequestBody RefundInfoDTO dto
    ){
        return ResponseEntity.ok(
                returnRequestService.submitRefundInfo(id, dto)
        );
    }

    @PostMapping("/{id}/complete-by-manager")
    public ResponseEntity<Void> completeByManager(
            @PathVariable String id
    ){
        returnRequestService.completeByManager(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/manager")
    public ResponseEntity<List<ReturnRequest>> getManagerRequests(){

        return ResponseEntity.ok(
                returnRequestService.getManagerRequests()
        );
    }
}