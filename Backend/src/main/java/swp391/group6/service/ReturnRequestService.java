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
import swp391.group6.dto.ReturnReportDTO;
import swp391.group6.dto.ReturnRequestDTO;
import swp391.group6.dto.ReturnRequestUpdateDTO;
import swp391.group6.model.*;
import swp391.group6.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    public List<Order> getAvailableOrders(String customerId) {

        return returnOrderRepository.findAvailableOrders(
                Long.parseLong(customerId)
        );
    }

    public List<OrderDetail> getOrderItems(String orderId) {

        Order order = orderRepository.findById(
                Long.parseLong(orderId)
        ).orElseThrow(
                () -> new IllegalArgumentException(
                        "Không thấy đơn hàng"
                )
        );

        return order.getOrderDetailList();
    }

    public List<Product> getAvailableProducts() {

        return productRepository.findAll()
                .stream()
                .filter(Product::isStatus)
                .toList();
    }

    //CREATE REQUEST
    public ReturnRequest submitRequest(
            String customerId,
            ReturnRequestDTO dto
    ) {

        validateBasic(dto);
        Order order = getValidOrder(
                customerId,
                dto.getOrderId()
        );

        boolean hasActiveRequest =
                returnRequestRepository
                        .existsByOrder_IdAndStatusNotIn(
                                order.getId(),
                                TERMINAL_STATUSES
                        );

        if (hasActiveRequest) {
            throw new IllegalStateException(
                    "Đơn này đã có yêu cầu hiện hành"
            );
        }

        validateEvidence(dto);


        ReturnRequest request =
                new ReturnRequest();
        request.setOrder(order);
        request.setCustomer(order.getUser());
        request.setReason(dto.getReason());
        request.setReturnType(dto.getReturnType());
        request.setStatus(ReturnStatus.PENDING);

        request.setItems(new ArrayList<>());
        request.setEvidences(new ArrayList<>());
        request.setExchangeProducts(new ArrayList<>());

        buildReturnItems(
                request,
                order,
                dto
        );

        if (dto.getReturnType()
                == ReturnType.EXCHANGE) {

            buildExchangeProducts(
                    request,
                    dto
            );
        }

        buildEvidence(
                request,
                dto
        );

        request.setExpectedFee(
                calculateExpectedFee(
                        request.getItems(),
                        request.getExchangeProducts()
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

    //VALIDATION
    private void validateBasic(
            ReturnRequestDTO dto
    ) {
        if (dto.getOrderId() == null) {
            throw new IllegalArgumentException(
                    "Mã đơn hàng là bắt buộc"
            );
        }

        if (dto.getReason() == null) {
            throw new IllegalArgumentException(
                    "Lý do trả hàng là bắt buộc"
            );
        }

        if (dto.getReturnType() == null) {
            throw new IllegalArgumentException(
                    "Loại yêu cầu trả hàng là bắt buộc"
            );
        }

        if (dto.getItems() == null ||
                dto.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Phải chọn ít nhất một sản phẩm"
            );
        }

        if (dto.getReturnType() == ReturnType.EXCHANGE
                &&
                (dto.getExchangeProducts() == null
                        ||
                        dto.getExchangeProducts().isEmpty())) {

            throw new IllegalArgumentException(
                    "Phải chọn sản phẩm đổi hàng"
            );
        }
    }

    private Order getValidOrder(
            String customerId,
            String orderId
    ) {

        Order order = orderRepository.findById(
                Long.parseLong(orderId)
        ).orElseThrow(
                () -> new IllegalArgumentException(
                        "Không tìm thấy đơn hàng"
                )
        );

        if (order.getUser() == null
                ||
                order.getUser().getId()
                        != Long.parseLong(customerId)) {

            throw new IllegalArgumentException(
                    "Đơn hàng không thuộc về khách hàng này"
            );
        }

        if (order.getStatus()
                != OrderStatus.RECEIVED) {

            throw new IllegalStateException(
                    "Chỉ có thể tạo yêu cầu trả hàng khi khách hàng đã nhận hàng"
            );
        }

        if (order.getDeliveryDate() == null
                ||
                order.getDeliveryDate()
                        .before(
                                Timestamp.valueOf(
                                        LocalDateTime.now()
                                                .minusDays(7)
                                )
                        )) {

            throw new IllegalStateException(
                    "Chỉ có thể trả hàng trong vòng 7 ngày kể từ khi nhận hàng"
            );
        }

        return order;
    }

    private void validateEvidence(
            ReturnRequestDTO dto
    ) {

        if (dto.getReason()
                == ReturnReason.DAMAGED) {


            int count =
                    dto.getEvidenceImageUrls() == null
                            ? 0
                            :
                            dto.getEvidenceImageUrls()
                                    .size();


            if (count < MIN_DAMAGED_EVIDENCE_COUNT) {

                throw new IllegalArgumentException(
                        "Lý do sản phẩm bị hư hỏng yêu cầu ít nhất 2 hình ảnh bằng chứng"
                );
            }
        }
    }

    //BUILD ITEMS
    private void buildReturnItems(
            ReturnRequest request,
            Order order,
            ReturnRequestDTO dto
    ) {
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
                                                                    .getProductId()
                                                    )
                                            )
                            )
                            .findFirst()
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Không tìm thấy sản phẩm trong đơn hàng"
                                            )
                            );

            if (itemDto.getQuantity() <= 0
                    ||
                    itemDto.getQuantity()
                            > detail.getQuantity()) {

                throw new IllegalArgumentException(
                        "Số lượng trả hàng không hợp lệ"
                );
            }

            ReturnRequestItem item =
                    new ReturnRequestItem();
            item.setReturnRequest(request);
            item.setOrderDetail(detail);
            item.setQuantity(
                    itemDto.getQuantity()
            );


            request.getItems()
                    .add(item);
        }
    }

    // BUILD EXCHANGE PRODUCTS
    private void buildExchangeProducts(
            ReturnRequest request,
            ReturnRequestDTO dto
    ) {
        int returnQuantity =
                request.getItems()
                        .stream()
                        .mapToInt(
                                ReturnRequestItem::getQuantity
                        )
                        .sum();

        int exchangeQuantity =
                dto.getExchangeProducts()
                        .stream()
                        .mapToInt(
                                ReturnRequestDTO.ExchangeProductDTO::getQuantity
                        )
                        .sum();

        if (returnQuantity != exchangeQuantity) {

            throw new IllegalArgumentException(
                    "Tổng số lượng sản phẩm đổi phải bằng tổng số lượng sản phẩm trả"
            );
        }

        for (ReturnRequestDTO.ExchangeProductDTO item
                : dto.getExchangeProducts()) {

            Product product =
                    productRepository.findById(
                                    Long.parseLong(
                                            item.getProductId()
                                    )
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalArgumentException(
                                                    "Không tìm thấy sản phẩm đổi"
                                            )
                            );

            ReturnExchangeProduct exchange =
                    new ReturnExchangeProduct();

            exchange.setReturnRequest(request);
            exchange.setProduct(product);
            exchange.setQuantity(
                    item.getQuantity()
            );


            request.getExchangeProducts()
                    .add(exchange);
        }
    }

    private void buildEvidence(
            ReturnRequest request,
            ReturnRequestDTO dto
    ) {

        if (dto.getEvidenceImageUrls() == null) {
            return;
        }

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


    //CALCULATE FEE
    private BigDecimal calculateExpectedFee(
            List<ReturnRequestItem> items,
            List<ReturnExchangeProduct> exchangeProducts
    ) {

        BigDecimal returnedValue =
                BigDecimal.ZERO;

        for (ReturnRequestItem item : items) {

            BigDecimal value =
                    item.getOrderDetail()
                            .getProduct()
                            .getPrice()
                            .multiply(
                                    ITEM_VALUE_RATE
                            )
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

        if (exchangeProducts == null
                ||
                exchangeProducts.isEmpty()) {

            return returnedValue.negate();
        }

        BigDecimal exchangeValue =
                BigDecimal.ZERO;


        for (ReturnExchangeProduct exchange
                : exchangeProducts) {

            exchangeValue =
                    exchangeValue.add(
                            exchange.getProduct()
                                    .getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    exchange.getQuantity()
                                            )
                                    )
                    );
        }

        return exchangeValue
                .subtract(returnedValue)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    //MANAGER FLOW
    // Returns all requests waiting for Manager review.
    public List<ReturnRequest> getPendingRequests() {

        return returnRequestRepository
                .findByStatus(
                        ReturnStatus.PENDING
                );
    }

    // Returns all requests that Manager needs to process.
    public List<ReturnRequest> getManagerRequests() {

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

    // Returns a single request by id.
    public ReturnRequest getRequestDetail(
            String id
    ) {

        return returnRequestRepository
                .findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Không tìm thấy yêu cầu trả hàng"
                        )
                );
    }

    // Manager approves pending request.
    public ReturnRequest approveRequest(
            String id
    ) {

        ReturnRequest request =
                getRequestDetail(id);


        if (request.getStatus()
                != ReturnStatus.PENDING) {
            throw new IllegalStateException(
                    "Chỉ yêu cầu đang chờ xử lý mới có thể được duyệt"
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

    // Manager rejects request.
    public ReturnRequest rejectRequest(
            String id,
            String reason
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        request.setStatus(
                ReturnStatus.REJECTED
        );

        request.setManagerNote(
                reason
        );

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_REQUEST_REJECTED,
                "RETURN_REQUEST_REJECTED_CUSTOMER",
                request.getId(),
                reason
        );
        return request;
    }

    // Customer cancels pending request.
    public ReturnRequest cancelRequest(
            String id
    ) {

        ReturnRequest request =
                getRequestDetail(id);

        if (request.getStatus()
                != ReturnStatus.PENDING) {

            throw new IllegalStateException(
                    "Chỉ yêu cầu đang chờ xử lý mới có thể được hủy"
            );
        }

        return rejectRequest(
                id,
                "Người dùng hủy yêu cầu"
        );
    }

    // Manager requests more information from customer.
    public ReturnRequest requestMoreInfo(
            String id
    ) {

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

    // Customer updates information after manager request.
    public ReturnRequest updateRequestInfo(
            String id,
            ReturnRequestUpdateDTO dto
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        request.setManagerNote(
                dto.getNote()
        );

        if (dto.getAdditionalImageUrls()
                != null) {

            dto.getAdditionalImageUrls()
                    .forEach(url -> {

                        ReturnEvidence evidence =
                                new ReturnEvidence();

                        evidence.setReturnRequest(
                                request
                        );

                        evidence.setImageUrl(
                                url
                        );

                        request.getEvidences()
                                .add(evidence);

                    });
        }
        return request;
    }

    //RETURN SHIPPING FLOW
    // Customer confirms item has been shipped back.
    public ReturnRequest markReturning(
            String id
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        if (request.getStatus()
                != ReturnStatus.APPROVED) {
            throw new IllegalStateException(
                    "Chỉ yêu cầu đã được duyệt mới có thể chuyển sang trạng thái đang hoàn trả"
            );
        }
        request.setStatus(
                ReturnStatus.RETURNING
        );
        return request;
    }

    // Manager confirms returned item arrived.
    public ReturnRequest confirmReturn(
            String id
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        if (request.getStatus()
                != ReturnStatus.RETURNING) {

            throw new IllegalStateException(
                    "Chỉ yêu cầu đang hoàn trả mới có thể xác nhận đã nhận hàng"
            );
        }
        request.setStatus(
                ReturnStatus.RECEIVED
        );

        return request;
    }

    // Calculates exchange price difference.
    public BigDecimal calculatePriceDifference(
            String id
    ) {

        ReturnRequest request =
                getRequestDetail(id);

        if (request.getReturnType()
                != ReturnType.EXCHANGE) {
            throw new IllegalStateException(
                    "Chỉ yêu cầu đổi hàng mới có chênh lệch giá"
            );
        }

        BigDecimal difference =
                calculateExpectedFee(
                        request.getItems(),
                        request.getExchangeProducts()
                );
        request.setPriceDifference(
                difference
        );

        return difference;
    }

    //PAYMENT
    public void completePayment(
            String id
    ) {

        ReturnRequest request =
                getRequestDetail(id);

        if (request.getStatus()
                != ReturnStatus.RECEIVED) {

            throw new IllegalStateException(
                    "Yêu cầu phải ở trạng thái đã nhận hàng trước khi xử lý thanh toán"
            );
        }

        if (request.getReturnType()
                == ReturnType.EXCHANGE) {

            BigDecimal diff =
                    request.getPriceDifference();

            if (diff != null
                    &&
                    diff.compareTo(
                            BigDecimal.ZERO
                    ) > 0) {

                request.setAdditionalPayment(
                        diff
                );

                notificationService.notifyUserByTemplate(
                        request.getCustomer().getId(),
                        NotificationType.RETURN_ADDITIONAL_PAYMENT_REQUIRED,
                        "RETURN_ADDITIONAL_PAYMENT_CUSTOMER",
                        request.getId(),
                        diff
                );

            } else {

                if (diff != null
                        &&
                        diff.compareTo(
                                BigDecimal.ZERO
                        ) < 0) {

                    request.setRefundAmount(
                            diff.abs()
                    );

                    notificationService.notifyUserByTemplate(
                            request.getCustomer().getId(),
                            NotificationType.RETURN_REFUND_PROCESSED,
                            "RETURN_REFUND_CUSTOMER",
                            request.getId()
                    );
                }
                request.setFinancialProcessed(
                        true
                );
                createExchangeOrder(
                        request
                );
            }
            request.setStatus(
                    ReturnStatus.PROCESSING
            );
        } else {
            BigDecimal refund =
                    request.getExpectedFee()
                            .abs();

            request.setRefundAmount(
                    refund
            );

            request.setStatus(
                    ReturnStatus.PROCESSING
            );

            notificationService.notifyUserByTemplate(
                    request.getCustomer().getId(),
                    NotificationType.RETURN_REFUND_PROCESSED,
                    "RETURN_REFUND_CUSTOMER",
                    request.getId()
            );
        }
    }

    // Customer confirms additional payment for exchange.
    public ReturnRequest confirmAdditionalPayment(
            String id
    ) {

        ReturnRequest request =
                getRequestDetail(id);


        if (request.getStatus()
                != ReturnStatus.PROCESSING) {

            throw new IllegalStateException(
                    "Yêu cầu phải đang xử lý để xác nhận thanh toán"
            );
        }

        if (request.getReturnType()
                != ReturnType.EXCHANGE
                ||
                request.getAdditionalPayment()
                        == null) {

            throw new IllegalStateException(
                    "Không có khoản thanh toán bổ sung cần xác nhận"
            );
        }

        request.setFinancialProcessed(
                true
        );

        createExchangeOrder(
                request
        );

        return returnRequestRepository.save(
                request
        );
    }

    // Creates exchange order from all exchange products.
    private void createExchangeOrder(
            ReturnRequest request
    ) {

        Order newOrder =
                new Order();

        newOrder.setUser(
                request.getCustomer()
        );

        newOrder.setShippingAddress(
                request.getOrder()
                        .getShippingAddress()
        );

        newOrder.setShippingFee(
                BigDecimal.ZERO
        );

        newOrder.setDiscount(
                BigDecimal.ZERO
        );

        newOrder.setCreatedAt(
                new Timestamp(
                        System.currentTimeMillis()
                )
        );

        newOrder.setStatus(
                OrderStatus.PROCESSING
        );

        List<OrderDetail> details =
                new ArrayList<>();

        for (ReturnExchangeProduct exchange
                : request.getExchangeProducts()) {

            OrderDetail detail =
                    new OrderDetail();

            detail.setOrder(
                    newOrder
            );

            detail.setProduct(
                    exchange.getProduct()
            );

            detail.setQuantity(
                    exchange.getQuantity()
            );

            detail.setPricePaid(
                    exchange.getProduct()
                            .getPrice()
            );


            details.add(detail);
        }

        newOrder.setOrderDetailList(
                details
        );

        orderRepository.save(
                newOrder
        );
    }

    //CUSTOMER REQUEST HISTORY
    public List<ReturnRequest> getCustomerRequests(
            String customerId
    ) {

        return returnRequestRepository
                .findByCustomer_Id(
                        Long.parseLong(customerId)
                );
    }

    public List<ReturnRequest> getApprovedRequests(
            String customerId
    ) {

        return returnRequestRepository
                .findByCustomer_IdAndStatus(
                        Long.parseLong(customerId),
                        ReturnStatus.APPROVED
                );
    }
    //MANAGER REPORT

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
            refundAmount =
                    BigDecimal.ZERO;
        }

        if (additionalPayment == null) {
            additionalPayment =
                    BigDecimal.ZERO;
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

    public List<ReturnRequest> getAllRequests() {
        return returnRequestRepository.findAll();
    }



    //REFUND INFORMATION


    public ReturnRequest submitRefundInfo(
            String id,
            RefundInfoDTO dto
    ) {

        ReturnRequest request =
                getRequestDetail(id);

        if (request.getStatus()
                != ReturnStatus.PROCESSING) {

            throw new IllegalStateException(
                    "Thông tin hoàn tiền chỉ được gửi khi yêu cầu đang xử lý"
            );
        }

        request.setBankName(
                dto.getBankName()
        );

        request.setAccountNumber(
                dto.getAccountNumber()
        );

        request.setAccountHolder(
                dto.getAccountHolder()
        );

        request.setManagerNote(
                String.format(
                        "Thông tin ngân hàng hoàn tiền: %s - %s - %s",
                        dto.getBankName(),
                        dto.getAccountNumber(),
                        dto.getAccountHolder()
                )
        );

        return returnRequestRepository.save(
                request
        );
    }
    // Manager completes request.
    public void completeByManager(
            String id
    ) {
        ReturnRequest request =
                getRequestDetail(id);

        if (request.getReturnType()
                == ReturnType.EXCHANGE
                &&
                request.getAdditionalPayment()
                        != null
                &&
                !request.isFinancialProcessed()) {
            throw new IllegalStateException(
                    "Khách hàng phải xác nhận thanh toán bổ sung trước khi hoàn tất yêu cầu"
            );
        }

        boolean refundOwed =
                request.getRefundAmount()
                        != null;

        if (refundOwed
                &&
                (
                        request.getBankName()
                                == null
                                ||
                                request.getAccountNumber()
                                        == null
                                ||
                                request.getAccountHolder()
                                        == null
                )) {
            throw new IllegalStateException(
                    "Khách hàng phải cung cấp thông tin ngân hàng hoàn tiền trước khi hoàn tất yêu cầu"
            );
        }

        request.setStatus(
                ReturnStatus.COMPLETED
        );


        request.setCompletedAt(
                LocalDateTime.now()
        );


        returnRequestRepository.save(
                request
        );
    }
}