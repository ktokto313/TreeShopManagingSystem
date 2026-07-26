/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestService.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-26
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

    // Customer gets orders that can be returned/exchanged
    public List<Order> getAvailableOrders(String customerId) {

        return returnOrderRepository.findAvailableOrders(
                Long.parseLong(customerId)
        );
    }

    // Customer selects order -> get products
    public List<OrderDetail> getOrderItems(String orderId) {

        Order order = orderRepository.findById(
                Long.parseLong(orderId)
        ).orElseThrow(
                () -> new IllegalArgumentException("Order not found")
        );

        return order.getOrderDetailList();
    }

    // Products available for exchange
    public List<Product> getAvailableProducts() {

        return productRepository.findAll()
                .stream()
                .filter(Product::isStatus)
                .toList();
    }

    // Customer creates return/exchange request
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
    public List<ReturnRequest> getPendingRequests() {
        return returnRequestRepository
                .findByStatus(ReturnStatus.PENDING);
    }


    public ReturnRequest getRequestDetail(String id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Return request not found"
                        )
                );
    }


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

    // Step: Customer cancels their own pending request.
    public ReturnRequest cancelRequest(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending requests can be cancelled"
            );
        }

        return rejectRequest(id, "Cancelled by customer");
    }

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


    public ReturnRequest markReturning(String id) {
        return updateStatus(
                id,
                ReturnStatus.RETURNING
        );
    }

    public ReturnRequest confirmReturn(String id) {
        return updateStatus(
                id,
                ReturnStatus.RECEIVED
        );
    }

    private ReturnRequest updateStatus(
            String id,
            ReturnStatus status
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        request.setStatus(status);
        return request;
    }

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
    // BR: only valid from RECEIVED; computes additionalPayment (EXCHANGE)
    // or refundAmount (RETURN) and moves the request to PROCESSING.
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
    // BR: only valid when status is PROCESSING, type EXCHANGE, and additionalPayment
    // was set by the manager; marks financialProcessed and creates the order that
    // ships the exchanged product, per swimlane "Create new order with status Processing".
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

    public List<ReturnRequest> getCustomerRequests(
            String customerId
    ) {

        return returnRequestRepository
                .findByCustomer_Id(
                        Long.parseLong(customerId)
                );
    }

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

    public List<ReturnRequest> getApprovedRequests(String customerId) {

        return returnRequestRepository
                .findByCustomer_IdAndStatus(
                        Long.parseLong(customerId),
                        ReturnStatus.APPROVED
                );
    }

    public List<ReturnRequest> getAllRequests(){
        return returnRequestRepository.findAll();
    }

    public ReturnRequest submitRefundInfo(String id, RefundInfoDTO dto){

        ReturnRequest r = getRequestDetail(id);

        r.setBankName(dto.getBankName());
        r.setAccountNumber(dto.getAccountNumber());
        r.setAccountHolder(dto.getAccountHolder());

        r.setStatus(ReturnStatus.PROCESSING);

        return returnRequestRepository.save(r);
    }

    public void completeByManager(String id){

        ReturnRequest r = getRequestDetail(id);

        if (r.getReturnType() == ReturnType.EXCHANGE
                && r.getAdditionalPayment() != null
                && !r.isFinancialProcessed()) {
            throw new IllegalStateException(
                    "Customer must confirm additional payment before completing"
            );
        }

        r.setStatus(ReturnStatus.COMPLETED);
        r.setCompletedAt(LocalDateTime.now());
        returnRequestRepository.save(r);
    }

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