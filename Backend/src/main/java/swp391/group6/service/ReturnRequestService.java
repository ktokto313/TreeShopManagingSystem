/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestService.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-27
 */
package swp391.group6.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.RefundInfoDTO;
import swp391.group6.dto.ReturnRequestDTO;
import swp391.group6.dto.ReturnRequestUpdateDTO;
import swp391.group6.model.*;
import swp391.group6.repository.*;
import swp391.group6.dto.ReturnReportDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReturnRequestService {

    private static final BigDecimal ITEM_VALUE_RATE =
            new BigDecimal("0.85");

    private static final int MIN_DAMAGED_EVIDENCE_COUNT = 2;

    private static final List<ReturnStatus> TERMINAL_STATUSES = List.of(
            ReturnStatus.REJECTED,
            ReturnStatus.COMPLETED
    );

    private final OrderRepository orderRepository;
    private final ReturnRequestOrderRepository returnOrderRepository;
    private final ProductRepository productRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final NotificationService notificationService;


    public ReturnRequestService(
            OrderRepository orderRepository,
            ReturnRequestOrderRepository returnOrderRepository,
            ProductRepository productRepository,
            ReturnRequestRepository returnRequestRepository,
            NotificationService notificationService
    ) {
        this.orderRepository = orderRepository;
        this.returnOrderRepository = returnOrderRepository;
        this.productRepository = productRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.notificationService = notificationService;
    }

    // Returns all orders belonging to the customer that are eligible to start a return/exchange request.
    public List<Order> getAvailableOrders(String customerId) {

        return returnOrderRepository.findAvailableOrders(
                Long.parseLong(customerId)
        );
    }

    // Returns the line items of a given order so the customer can pick which products to return.
    public List<OrderDetail> getOrderItems(String orderId) {

        Order order = orderRepository.findById(
                Long.parseLong(orderId)
        ).orElseThrow(
                () -> new IllegalArgumentException("Order not found")
        );

        return order.getOrderDetailList();
    }

    // Returns all active (in-stock) products the customer can choose as an exchange target.
    public List<Product> getAvailableProducts() {

        return productRepository.findAll()
                .stream()
                .filter(Product::isStatus)
                .toList();
    }

    // Creates a new return/exchange request: validates order ownership, blocks duplicate
    // active requests on the same order (BR), enforces the min-2-images rule for DAMAGED (BR-?),
    // builds items/evidence/exchange-product sub-entities, computes the expected fee, saves the
    // request, and notifies the Manager role.
    public ReturnRequest submitRequest(
            String customerId,
            ReturnRequestDTO dto
    ) {

        Order order = orderRepository.findById(
                Long.parseLong(dto.getOrderId())
        ).orElseThrow(
                () -> new IllegalArgumentException("Order not found")
        );
        if (order.getUser() == null ||
                order.getUser().getId() != Long.parseLong(customerId)) {

            throw new IllegalArgumentException(
                    "Order does not belong to customer"
            );
        }

        // an order can only have 1 active (non-terminal) return/exchange
        boolean hasActiveRequest =
                returnRequestRepository.existsByOrder_IdAndStatusNotIn(
                        order.getId(),
                        TERMINAL_STATUSES
                );

        if (hasActiveRequest) {
            throw new IllegalStateException(
                    "This order already has an active return/exchange request"
            );
        }

        if (dto.getReason() == ReturnReason.DAMAGED) {
            int evidenceCount =
                    dto.getEvidenceImageUrls() == null
                            ? 0
                            : dto.getEvidenceImageUrls().size();
            if (evidenceCount < MIN_DAMAGED_EVIDENCE_COUNT) {
                throw new IllegalArgumentException(
                        "Damaged reason requires at least 2 images"
                );
            }
        }

        ReturnRequest request =
                new ReturnRequest();
        request.setOrder(order);
        request.setCustomer(order.getUser());
        request.setReason(dto.getReason());
        request.setReturnType(dto.getReturnType());
        request.setStatus(ReturnStatus.PENDING);
        for (ReturnRequestDTO.OrderDetailQuantityDTO itemDto
                : dto.getItems()) {

            OrderDetail detail =
                    order.getOrderDetailList()
                            .stream()
                            .filter(d ->
                                    String.valueOf(
                                                    d.getId()
                                                            .getProductId()
                                            )
                                            .equals(
                                                    String.valueOf(
                                                            itemDto
                                                                    .getOrderDetailId()
                                                    )
                                            )
                            )
                            .findFirst()
                            .orElseThrow(
                                    () -> new IllegalArgumentException(
                                            "Order detail not found"
                                    )
                            );

            ReturnRequestItem item =
                    new ReturnRequestItem();
            item.setReturnRequest(request);
            item.setOrderDetail(detail);
            item.setQuantity(itemDto.getQuantity());

            request.getItems()
                    .add(item);
        }
        Product exchangeProduct = null;
        if (dto.getReturnType()
                == ReturnType.EXCHANGE) {

            exchangeProduct =
                    productRepository.findById(
                                    Long.parseLong(
                                            dto.getExchangeProductId()
                                    )
                            )
                            .orElseThrow(
                                    () -> new IllegalArgumentException(
                                            "Exchange product not found"
                                    )
                            );

            ReturnExchangeProduct exchange =
                    new ReturnExchangeProduct();

            exchange.setReturnRequest(request);
            exchange.setProduct(exchangeProduct);

            request.setExchangeProduct(exchange);
        }


        if (dto.getEvidenceImageUrls() != null) {

            dto.getEvidenceImageUrls()
                    .forEach(url -> {

                        ReturnEvidence evidence =
                                new ReturnEvidence();

                        evidence.setReturnRequest(request);
                        evidence.setImageUrl(url);

                        request.getEvidences()
                                .add(evidence);
                    });
        }

        request.setExpectedFee(
                calculateExpectedFee(
                        request.getItems(),
                        exchangeProduct
                )
        );
        ReturnRequest saved =
                returnRequestRepository.save(request);

        notificationService.notifyRoleByTemplate(
                "MANAGER",
                NotificationType.RETURN_REQUEST_CREATED,
                "RETURN_REQUEST_CREATED_MANAGER",
                saved.getId()
        );
        return saved;
    }

    // Computes the expected fee at request-creation time: returned items' value at 85% of price,
    // negated for a pure RETURN (refund owed to customer), or exchange-product price minus that
    // value for an EXCHANGE (positive = customer owes more, negative = customer is owed a refund).
    private BigDecimal calculateExpectedFee(
            List<ReturnRequestItem> items,
            Product exchangeProduct
    ) {

        BigDecimal returnedValue =
                BigDecimal.ZERO;

        for (ReturnRequestItem item : items) {

            BigDecimal price =
                    item.getOrderDetail()
                            .getProduct()
                            .getPrice();
            BigDecimal value =
                    price.multiply(ITEM_VALUE_RATE)
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            returnedValue =
                    returnedValue.add(value);
        }

        returnedValue =
                returnedValue.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        if (exchangeProduct == null) {

            return returnedValue.negate();
        }

        return exchangeProduct.getPrice()
                .subtract(returnedValue)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // Returns all requests currently awaiting Manager review.
    public List<ReturnRequest> getPendingRequests() {
        return returnRequestRepository
                .findByStatus(ReturnStatus.PENDING);
    }

    // Fetches a single return/exchange request by id, or throws if not found.
    public ReturnRequest getRequestDetail(String id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Return request not found"
                        )
                );
    }

    // Manager approves a PENDING request, moving it to APPROVED and notifying the customer.
    public ReturnRequest approveRequest(String id) {
        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending requests can be approved"
            );
        }

        request.setStatus(
                ReturnStatus.APPROVED
        );

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_REQUEST_APPROVED,
                "RETURN_REQUEST_APPROVED_CUSTOMER",
                request.getId()
        );

        return request;
    }

    // Manager (or the cancel flow) rejects a request with a reason, moving it to REJECTED,
    // recording the reason as the manager note, and notifying the customer.
    public ReturnRequest rejectRequest(
            String id,
            String reason
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        request.setStatus(
                ReturnStatus.REJECTED
        );

        request.setManagerNote(reason);

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_REQUEST_REJECTED,
                "RETURN_REQUEST_REJECTED_CUSTOMER",
                request.getId(),
                reason
        );
        return request;
    }

    // Customer cancels their own request while it's still PENDING (reuses the reject flow with
    // a fixed "Cancelled by customer" note).
    public ReturnRequest cancelRequest(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending requests can be cancelled"
            );
        }

        return rejectRequest(id, "Cancelled by customer");
    }

    // Manager asks the customer for more evidence/info; just notifies the customer, no status change.
    public ReturnRequest requestMoreInfo(String id) {
        ReturnRequest request =
                getRequestDetail(id);
        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_MORE_INFO_REQUIRED,
                "RETURN_MORE_INFO_CUSTOMER",
                request.getId()
        );

        return request;
    }

    // Customer submits additional info/evidence in response to a Manager's request; updates the
    // manager note and appends any new evidence images.
    public ReturnRequest updateRequestInfo(
            String id,
            ReturnRequestUpdateDTO dto
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        request.setManagerNote(
                dto.getNote()
        );

        if (dto.getAdditionalImageUrls() != null) {
            dto.getAdditionalImageUrls()
                    .forEach(url -> {

                        ReturnEvidence evidence =
                                new ReturnEvidence();

                        evidence.setReturnRequest(request);
                        evidence.setImageUrl(url);

                        request.getEvidences()
                                .add(evidence);
                    });
        }

        return request;
    }

    // Customer confirms they've shipped the item back on an approved request, moving it to RETURNING.
    public ReturnRequest markReturning(String id) {
        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.APPROVED) {
            throw new IllegalStateException(
                    "Only approved requests can be marked as returning"
            );
        }

        request.setStatus(ReturnStatus.RETURNING);
        return request;
    }

    // Manager confirms the returned/exchanged item has arrived, moving the request to RECEIVED.
    public ReturnRequest confirmReturn(String id) {
        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.RETURNING) {
            throw new IllegalStateException(
                    "Only returning requests can be marked as received"
            );
        }

        request.setStatus(ReturnStatus.RECEIVED);
        return request;
    }

    // Recalculates and stores the price difference (exchange product price vs. returned item
    // value) for an EXCHANGE request; throws if the request isn't an exchange.
    public BigDecimal calculatePriceDifference(String id) {
        ReturnRequest request =
                getRequestDetail(id);
        if (request.getReturnType()
                != ReturnType.EXCHANGE) {
            throw new IllegalStateException(
                    "Only exchange has price difference"
            );
        }

        BigDecimal difference =
                calculateExpectedFee(
                        request.getItems(),
                        request.getExchangeProduct()
                                .getProduct()
                );

        request.setPriceDifference(
                difference
        );

        return difference;
    }

    // Step: Manager processes payment/refund after receiving the item.
    public void completePayment(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.RECEIVED) {
            throw new IllegalStateException("Must be RECEIVED before processing payment");
        }

        if (request.getReturnType() == ReturnType.EXCHANGE) {

            BigDecimal diff = request.getPriceDifference();

            if (diff != null && diff.compareTo(BigDecimal.ZERO) > 0) {

                request.setAdditionalPayment(diff);

                notificationService.notifyUserByTemplate(
                        request.getCustomer().getId(),
                        NotificationType.RETURN_ADDITIONAL_PAYMENT_REQUIRED,
                        "RETURN_ADDITIONAL_PAYMENT_CUSTOMER",
                        request.getId(),
                        diff
                );

            } else {

                if (diff != null && diff.compareTo(BigDecimal.ZERO) < 0) {

                    request.setRefundAmount(diff.abs());

                    notificationService.notifyUserByTemplate(
                            request.getCustomer().getId(),
                            NotificationType.RETURN_REFUND_PROCESSED,
                            "RETURN_REFUND_CUSTOMER",
                            request.getId()
                    );
                }

                // No additional payment owed — ship the exchange product right away.
                request.setFinancialProcessed(true);
                createExchangeOrder(request);
            }

            request.setStatus(ReturnStatus.PROCESSING);
        }

        else {

            BigDecimal refund = request.getExpectedFee().abs();

            request.setRefundAmount(refund);

            request.setStatus(ReturnStatus.PROCESSING);

            notificationService.notifyUserByTemplate(
                    request.getCustomer().getId(),
                    NotificationType.RETURN_REFUND_PROCESSED,
                    "RETURN_REFUND_CUSTOMER",
                    request.getId()
            );
        }
    }

    // Step: Customer confirms they have paid the additional amount for an exchange.
    public ReturnRequest confirmAdditionalPayment(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PROCESSING) {
            throw new IllegalStateException(
                    "Request must be PROCESSING to confirm payment"
            );
        }

        if (request.getReturnType() != ReturnType.EXCHANGE
                || request.getAdditionalPayment() == null) {
            throw new IllegalStateException(
                    "No additional payment to confirm"
            );
        }

        request.setFinancialProcessed(true);

        createExchangeOrder(request);

        return returnRequestRepository.save(request);
    }

    // Step: Build and persist the new order (status PROCESSING) that ships the
    // exchange product to the customer, with cascaded OrderDetail line.
    private void createExchangeOrder(ReturnRequest request) {

        Product exchangeProduct =
                request.getExchangeProduct().getProduct();

        int totalQuantity =
                request.getItems()
                        .stream()
                        .mapToInt(ReturnRequestItem::getQuantity)
                        .sum();

        Order newOrder = new Order();
        newOrder.setUser(request.getCustomer());
        newOrder.setShippingAddress(
                request.getOrder().getShippingAddress()
        );
        newOrder.setShippingFee(BigDecimal.ZERO);
        newOrder.setDiscount(BigDecimal.ZERO);
        newOrder.setCreatedAt(
                new Timestamp(System.currentTimeMillis())
        );
        newOrder.setStatus(OrderStatus.PROCESSING);

        OrderDetail detail = new OrderDetail();
        detail.setOrder(newOrder);
        detail.setProduct(exchangeProduct);
        detail.setQuantity(totalQuantity);
        detail.setPricePaid(
                exchangeProduct.getPrice()
        );

        newOrder.setOrderDetailList(List.of(detail));

        orderRepository.save(newOrder);
    }

    // Returns all return/exchange requests ever submitted by this customer (any status).
    public List<ReturnRequest> getCustomerRequests(
            String customerId
    ) {

        return returnRequestRepository
                .findByCustomer_Id(
                        Long.parseLong(customerId)
                );
    }

    // Builds the Manager's return/exchange report: total request count, completed count,
    // total refunded, total additional payments collected, and their net revenue impact.
    public ReturnReportDTO getReturnReport() {


        long totalRequests =
                returnRequestRepository.count();


        long completedReturns =
                returnRequestRepository.countByStatus(
                        ReturnStatus.COMPLETED
                );


        BigDecimal refundAmount =
                returnRequestRepository
                        .sumRefundAmountByStatus(
                                ReturnStatus.COMPLETED
                        );


        BigDecimal additionalPayment =
                returnRequestRepository
                        .sumAdditionalPaymentByStatus(
                                ReturnStatus.COMPLETED
                        );


        if (refundAmount == null) {
            refundAmount = BigDecimal.ZERO;
        }


        if (additionalPayment == null) {
            additionalPayment = BigDecimal.ZERO;
        }


        BigDecimal revenueImpact =
                additionalPayment.subtract(
                        refundAmount
                );


        return new ReturnReportDTO(
                totalRequests,
                completedReturns,
                refundAmount,
                additionalPayment,
                revenueImpact
        );
    }

    // Returns this customer's requests that have been approved (used to filter which orders
    // are eligible to move to the "Return" action).
    public List<ReturnRequest> getApprovedRequests(String customerId) {

        return returnRequestRepository
                .findByCustomer_IdAndStatus(
                        Long.parseLong(customerId),
                        ReturnStatus.APPROVED
                );
    }

    // Returns every return/exchange request in the system, regardless of status.
    public List<ReturnRequest> getAllRequests(){
        return returnRequestRepository.findAll();
    }

    // Customer submits refund bank details (bank name, account number, account holder) for a
    public ReturnRequest submitRefundInfo(String id, RefundInfoDTO dto){

        ReturnRequest r = getRequestDetail(id);

        if (r.getStatus() != ReturnStatus.PROCESSING) {
            throw new IllegalStateException(
                    "Refund info can only be submitted while the request is processing"
            );
        }

        r.setBankName(dto.getBankName());
        r.setAccountNumber(dto.getAccountNumber());
        r.setAccountHolder(dto.getAccountHolder());

        r.setManagerNote(String.format(
                "Refund bank info: %s - %s - %s",
                dto.getBankName(),
                dto.getAccountNumber(),
                dto.getAccountHolder()
        ));

        return returnRequestRepository.save(r);
    }

    // Manager marks a request as fully done, recording the completion time.
    public void completeByManager(String id){

        ReturnRequest r = getRequestDetail(id);

        if (r.getReturnType() == ReturnType.EXCHANGE
                && r.getAdditionalPayment() != null
                && !r.isFinancialProcessed()) {
            throw new IllegalStateException(
                    "Customer must confirm additional payment before completing"
            );
        }

        boolean refundOwed = r.getRefundAmount() != null;

        if (refundOwed
                && (r.getBankName() == null
                || r.getAccountNumber() == null
                || r.getAccountHolder() == null)) {
            throw new IllegalStateException(
                    "Refund bank info must be submitted before completing"
            );
        }

        r.setStatus(ReturnStatus.COMPLETED);
        r.setCompletedAt(LocalDateTime.now());
        returnRequestRepository.save(r);
    }

    // Returns all requests still requiring Manager attention (any non-terminal, non-cancelled status).
    public List<ReturnRequest> getManagerRequests(){

        return returnRequestRepository.findByStatusIn(
                List.of(
                        ReturnStatus.PENDING,
                        ReturnStatus.APPROVED,
                        ReturnStatus.RETURNING,
                        ReturnStatus.RECEIVED,
                        ReturnStatus.PROCESSING
                )
        );
    }
}