/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestService.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-08-03
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
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@Transactional
public class ReturnRequestService {

    private static final BigDecimal CUSTOMER_FAULT_REFUND_RATE = new BigDecimal("0.85");
    private static final BigDecimal SHOP_FAULT_REFUND_RATE = BigDecimal.ONE;
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
    @Value("${checkout.bank-id:${CHECKOUT_BANK_ID:}}")
    private String bankId;
    @Value("${checkout.bank-account-no:${CHECKOUT_BANK_ACCOUNT_NO:}}")
    private String bankAccountNo;
    @Value("${checkout.bank-account-name:${CHECKOUT_BANK_ACCOUNT_NAME:}}")
    private String bankAccountName;
    @Value("${checkout.qr-template:${CHECKOUT_QR_TEMPLATE:compact2}}")
    private String qrTemplate;

    public ReturnRequestService(OrderRepository orderRepository,
                                ReturnRequestOrderRepository returnOrderRepository,
                                ProductRepository productRepository,
                                ReturnRequestRepository returnRequestRepository,
                                NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.returnOrderRepository = returnOrderRepository;
        this.productRepository = productRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.notificationService = notificationService;
    }

    public List<Order> getAvailableOrders(String customerId) {
        return returnOrderRepository.findAvailableOrders(Long.parseLong(customerId));
    }

    public List<OrderDetail> getOrderItems(String orderId) {
        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new IllegalArgumentException("Không thấy đơn hàng"));

        return order.getOrderDetailList();
    }

    public List<Product> getAvailableProducts() {
        return productRepository.findAll()
                .stream()
                .filter(Product::isStatus)
                .toList();
    }

    private boolean isShopResponsibleReason(ReturnReason reason) {
        return reason == ReturnReason.DAMAGED
                || reason == ReturnReason.WRONG_ITEM;
    }

    private boolean requiresEvidence(ReturnReason reason) {
        return reason == ReturnReason.DAMAGED;
    }

    //CREATE REQUEST
    public ReturnRequest submitRequest(String customerId, ReturnRequestDTO dto) {
        validateBasic(dto);

        Order order = getValidOrder(customerId, dto.getOrderId());

        ReturnRequest request = new ReturnRequest();
        request.setOrder(order);
        request.setCustomer(order.getUser());
        request.setReason(dto.getReason());
        request.setReturnType(dto.getReturnType());
        request.setStatus(ReturnStatus.PENDING);

        request.setItems(new ArrayList<>());
        request.setExchangeProducts(new ArrayList<>());
        request.setEvidences(new ArrayList<>());

        buildReturnItems(request, order, dto);

        if (dto.getReturnType() == ReturnType.EXCHANGE) {
            buildExchangeProducts(request, dto);
        }

        buildEvidence(request, dto);

        validateEvidence(request);

        BigDecimal returnedValue = calculateReturnedValue(request);

        if (dto.getReturnType() == ReturnType.RETURN) {

            request.setRefundAmount(returnedValue);
            request.setExpectedFee(returnedValue);

            request.setPriceDifference(BigDecimal.ZERO);
            request.setAdditionalPayment(BigDecimal.ZERO);

        } else {
            // EXCHANGE

            BigDecimal exchangeValue =
                    calculateExchangeValue(request.getExchangeProducts());

            BigDecimal difference =
                    exchangeValue.subtract(returnedValue)
                            .setScale(2, RoundingMode.HALF_UP);

            request.setRefundAmount(
                    difference.compareTo(BigDecimal.ZERO) < 0
                            ? difference.abs()
                            : BigDecimal.ZERO
            );

            request.setPriceDifference(difference);

            request.setAdditionalPayment(
                    difference.compareTo(BigDecimal.ZERO) > 0
                            ? difference
                            : BigDecimal.ZERO
            );

            request.setExpectedFee(difference);
        }

        ReturnRequest saved = returnRequestRepository.save(request);

        notificationService.notifyRoleByTemplate(
                "MANAGER",
                NotificationType.RETURN_REQUEST_CREATED,
                "RETURN_REQUEST_CREATED_MANAGER",
                saved.getId()
        );
        return saved;
    }

    //VALIDATION
    private void validateBasic(ReturnRequestDTO dto) {

        if (dto.getOrderId() == null) {
            throw new IllegalArgumentException("Mã đơn hàng là bắt buộc");
        }

        if (dto.getReason() == null) {
            throw new IllegalArgumentException("Lý do trả hàng là bắt buộc");
        }

        if (dto.getReturnType() == null) {
            throw new IllegalArgumentException("Loại yêu cầu trả hàng là bắt buộc");
        }

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Phải chọn ít nhất một sản phẩm");
        }

        if (dto.getReturnType() == ReturnType.EXCHANGE &&
                (dto.getExchangeProducts() == null || dto.getExchangeProducts().isEmpty())) {
            throw new IllegalArgumentException("Phải chọn sản phẩm đổi hàng");
        }
    }

    private Order getValidOrder(String customerId, String orderId) {

        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));

        if (order.getUser() == null || order.getUser().getId() != Long.parseLong(customerId)) {
            throw new IllegalArgumentException("Đơn hàng không thuộc về khách hàng này");
        }

        if (order.getStatus() != OrderStatus.RECEIVED) {
            throw new IllegalStateException(
                    "Chỉ có thể tạo yêu cầu trả hàng khi khách hàng đã nhận hàng"
            );
        }

        if (order.getDeliveryDate() == null ||
                order.getDeliveryDate().before(
                        Timestamp.valueOf(LocalDateTime.now().minusDays(7))
                )) {
            throw new IllegalStateException(
                    "Chỉ có thể trả hàng trong vòng 7 ngày kể từ khi nhận hàng"
            );
        }

        return order;
    }

    private void validateEvidence(ReturnRequest request) {
        if (requiresEvidence(request.getReason())) {

            int count = request.getEvidences() == null
                    ? 0
                    : request.getEvidences().size();

            if (count < MIN_DAMAGED_EVIDENCE_COUNT) {
                throw new IllegalArgumentException(
                        "Lý do này yêu cầu ít nhất 2 hình ảnh bằng chứng"
                );
            }
        }
    }

    //BUILD ITEMS
    private void buildReturnItems(ReturnRequest request, Order order, ReturnRequestDTO dto) {

        for (ReturnRequestDTO.OrderDetailQuantityDTO itemDto : dto.getItems()) {

            OrderDetail detail = order.getOrderDetailList()
                    .stream()
                    .filter(d -> String.valueOf(d.getId().getProductId())
                            .equals(String.valueOf(itemDto.getProductId())))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy sản phẩm trong đơn hàng"
                    ));

            Long productId = detail.getId().getProductId();

            boolean activeRequest = returnRequestRepository.existsActiveReturnForProduct(
                    order.getId(),
                    productId,
                    TERMINAL_STATUSES
            );

            if (activeRequest) {
                throw new IllegalStateException(
                        "Sản phẩm này đang có yêu cầu đổi trả chưa hoàn thành"
                );
            }

            Integer completedQuantity = returnRequestRepository.sumCompletedReturnQuantity(
                    order.getId(),
                    productId
            );

            if (completedQuantity == null) {
                completedQuantity = 0;
            }

            int availableQuantity = detail.getQuantity() - completedQuantity;

            if (itemDto.getQuantity() <= 0 || itemDto.getQuantity() > availableQuantity) {
                throw new IllegalArgumentException(
                        "Số lượng sản phẩm trả vượt quá số lượng còn lại"
                );
            }

            ReturnRequestItem item = new ReturnRequestItem();
            item.setReturnRequest(request);
            item.setOrderDetail(detail);
            item.setQuantity(itemDto.getQuantity());

            request.getItems().add(item);
        }
    }

    // BUILD EXCHANGE PRODUCTS
    private void buildExchangeProducts(ReturnRequest request, ReturnRequestDTO dto) {

        int returnQuantity = request.getItems()
                .stream()
                .mapToInt(ReturnRequestItem::getQuantity)
                .sum();

        int exchangeQuantity = dto.getExchangeProducts()
                .stream()
                .mapToInt(ReturnRequestDTO.ExchangeProductDTO::getQuantity)
                .sum();

        if (returnQuantity != exchangeQuantity) {
            throw new IllegalArgumentException(
                    "Tổng số lượng sản phẩm đổi phải bằng tổng số lượng sản phẩm trả"
            );
        }

        for (ReturnRequestDTO.ExchangeProductDTO item : dto.getExchangeProducts()) {

            if (item.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Số lượng sản phẩm đổi không hợp lệ"
                );
            }

            Product product = productRepository.findById(Long.parseLong(item.getProductId()))
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy sản phẩm đổi"
                    ));

            if (!product.isStatus()) {
                throw new IllegalArgumentException(
                        "Sản phẩm đổi hiện không khả dụng"
                );
            }

            ReturnExchangeProduct exchange = new ReturnExchangeProduct();
            exchange.setReturnRequest(request);
            exchange.setProduct(product);
            exchange.setQuantity(item.getQuantity());

            request.getExchangeProducts().add(exchange);
        }
    }

    private void buildEvidence(ReturnRequest request, ReturnRequestDTO dto) {

        if (dto.getEvidenceImageUrls() == null) {
            return;
        }

        dto.getEvidenceImageUrls().forEach(url -> {

            ReturnEvidence evidence = new ReturnEvidence();
            evidence.setReturnRequest(request);
            evidence.setImageUrl(url);

            request.getEvidences().add(evidence);
        });
    }

    //CALCULATE FEE
    private BigDecimal calculateReturnedValue(ReturnRequest request) {

        BigDecimal total = BigDecimal.ZERO;

        BigDecimal refundRate =
                isShopResponsibleReason(request.getReason())
                        ? SHOP_FAULT_REFUND_RATE
                        : CUSTOMER_FAULT_REFUND_RATE;

        for (ReturnRequestItem item : request.getItems()) {

            BigDecimal productValue =
                    item.getOrderDetail()
                            .getProduct()
                            .getPrice()
                            .multiply(refundRate)
                            .multiply(
                                    BigDecimal.valueOf(item.getQuantity())
                            );

            total = total.add(productValue);
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateExchangeValue(List<ReturnExchangeProduct> products) {

        BigDecimal total = BigDecimal.ZERO;

        if (products == null || products.isEmpty()) {
            return total;
        }

        for (ReturnExchangeProduct item : products) {

            BigDecimal value = item.getProduct()
                    .getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            total = total.add(value);
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    //MANAGER FLOW
    // Returns all requests waiting for Manager review.
    public List<ReturnRequest> getPendingRequests() {
        return returnRequestRepository.findByStatus(ReturnStatus.PENDING);
    }

    // Returns all requests that Manager needs to process.
    public List<ReturnRequest> getManagerRequests() {

        return returnRequestRepository.findByStatusIn(
                List.of(
                        ReturnStatus.PENDING,
                        ReturnStatus.APPROVED,
                        ReturnStatus.RETURNING,
                        ReturnStatus.RECEIVED,
                        ReturnStatus.PROCESSING,
                        ReturnStatus.WAITING_CUSTOMER_INFO,
                        ReturnStatus.WAITING_PAYMENT,
                        ReturnStatus.WAITING_BANK_INFO
                )
        );
    }

    // Returns a single request by id.
    public ReturnRequest getRequestDetail(String id) {
        ReturnRequest request =
                returnRequestRepository.findDetailById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Không tìm thấy yêu cầu trả hàng"
                                )
                        );
        request.getItems()
                .forEach(item ->
                        item.getOrderDetail()
                                .getProduct()
                                .getPrice()
                );

        request.getExchangeProducts()
                .forEach(item ->
                        item.getProduct()
                                .getPrice()
                );
        return request;
    }

    // Manager approves pending request.
    public ReturnRequest approveRequest(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING &&
                request.getStatus() != ReturnStatus.WAITING_CUSTOMER_INFO) {

            throw new IllegalStateException(
                    "Yêu cầu không thể được duyệt"
            );
        }

        request.setStatus(ReturnStatus.APPROVED);

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_REQUEST_APPROVED,
                "RETURN_REQUEST_APPROVED_CUSTOMER",
                request.getId()
        );

        return request;
    }

    // Manager rejects request.
    public ReturnRequest rejectRequest(String id, String reason) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING &&
                request.getStatus() != ReturnStatus.RECEIVED) {

            throw new IllegalStateException(
                    "Chỉ có thể từ chối khi đang chờ duyệt hoặc sau khi nhận hàng"
            );
        }

        request.setStatus(ReturnStatus.REJECTED);
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

    // Customer cancels pending request.
    public ReturnRequest cancelRequest(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING) {
            throw new IllegalStateException(
                    "Chỉ yêu cầu đang chờ xử lý mới có thể được hủy"
            );
        }

        request.setStatus(ReturnStatus.REJECTED);
        request.setManagerNote("Người dùng hủy yêu cầu");

        return request;
    }

    // Manager requests more information from customer.
    public ReturnRequest requestMoreInfo(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING) {

            throw new IllegalStateException(
                    "Chỉ yêu cầu đang chờ xử lý mới có thể yêu cầu bổ sung thông tin"
            );
        }
        request.setStatus(ReturnStatus.WAITING_CUSTOMER_INFO);
        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_MORE_INFO_REQUIRED,
                "RETURN_MORE_INFO_CUSTOMER",
                request.getId()
        );

        return request;
    }

    // Customer updates request before manager approval
    public ReturnRequest updateRequestInfo(String id, ReturnRequestUpdateDTO dto) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PENDING &&
                request.getStatus() != ReturnStatus.WAITING_CUSTOMER_INFO) {

            throw new IllegalStateException(
                    "Chỉ có thể cập nhật khi yêu cầu chưa được duyệt"
            );
        }

        request.setManagerNote(dto.getNote());

        if (dto.getAdditionalImageUrls() != null) {
            dto.getAdditionalImageUrls()
                    .forEach(url -> {
                        ReturnEvidence evidence = new ReturnEvidence();
                        evidence.setReturnRequest(request);
                        evidence.setImageUrl(url);

                        request.getEvidences()
                                .add(evidence);
                    });
        }

        if (request.getStatus() == ReturnStatus.WAITING_CUSTOMER_INFO) {
            request.setStatus(ReturnStatus.PENDING);
            notificationService.notifyRoleByTemplate(
                    "MANAGER",
                    NotificationType.RETURN_CUSTOMER_INFO_UPDATED,
                    "RETURN_CUSTOMER_INFO_UPDATED_MANAGER",
                    request.getId()
            );
        }
        return request;
    }

    //RETURN SHIPPING FLOW
    // Customer confirms item has been shipped back.
    public ReturnRequest markReturning(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.APPROVED) {
            throw new IllegalStateException(
                    "Chỉ yêu cầu đã duyệt mới được gửi trả"
            );
        }

        request.setStatus(ReturnStatus.RETURNING);

        notificationService.notifyRoleByTemplate(
                "MANAGER",
                NotificationType.RETURN_ITEM_RETURNING,
                "RETURN_ITEM_RETURNING_MANAGER",
                request.getId()
        );

        return request;
    }

    // Manager confirms returned item arrived.
    public ReturnRequest confirmReturn(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.RETURNING) {
            throw new IllegalStateException(
                    "Yêu cầu chưa ở trạng thái đang hoàn trả"
            );
        }

        request.setStatus(ReturnStatus.RECEIVED);

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_ITEM_RECEIVED,
                "RETURN_RECEIVED_CUSTOMER",
                request.getId()
        );

        return request;
    }

    // Calculates exchange price difference.
    public BigDecimal calculatePriceDifference(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getReturnType() != ReturnType.EXCHANGE) {

            throw new IllegalStateException(
                    "Chỉ yêu cầu đổi hàng mới có chênh lệch giá"
            );
        }

        BigDecimal returnedValue =
                calculateReturnedValue(request);

        BigDecimal exchangeValue =
                calculateExchangeValue(
                        request.getExchangeProducts()
                );

        BigDecimal difference =
                exchangeValue.subtract(returnedValue)
                        .setScale(2, RoundingMode.HALF_UP);


        request.setPriceDifference(difference);

        request.setRefundAmount(
                difference.compareTo(BigDecimal.ZERO) < 0
                        ? difference.abs()
                        : BigDecimal.ZERO
        );

        request.setAdditionalPayment(
                difference.compareTo(BigDecimal.ZERO) > 0
                        ? difference
                        : BigDecimal.ZERO
        );

        return difference;
    }

    //PAYMENT
    // Process financial requirement after returned item is received.
    public void completePayment(String id) {
        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.RECEIVED) {
            throw new IllegalStateException(
                    "Yêu cầu phải ở trạng thái đã nhận hàng trước khi xử lý tài chính"
            );
        }

        // ===== EXCHANGE =====
        if (request.getReturnType() == ReturnType.EXCHANGE) {

            BigDecimal diff = calculatePriceDifference(id);

            // Customer needs to pay more
            if (diff.compareTo(BigDecimal.ZERO) > 0) {

                request.setAdditionalPayment(diff);
                request.setStatus(ReturnStatus.WAITING_PAYMENT);

                notificationService.notifyUserByTemplate(
                        request.getCustomer().getId(),
                        NotificationType.RETURN_ADDITIONAL_PAYMENT_REQUIRED,
                        "RETURN_ADDITIONAL_PAYMENT_CUSTOMER",
                        request.getId(),
                        diff
                );

                return;
            }


            // Shop needs to refund customer
            if (diff.compareTo(BigDecimal.ZERO) < 0) {

                request.setRefundAmount(diff.abs());
                request.setStatus(ReturnStatus.WAITING_BANK_INFO);

                notificationService.notifyUserByTemplate(
                        request.getCustomer().getId(),
                        NotificationType.RETURN_BANK_INFO_REQUIRED,
                        "RETURN_BANK_INFO_CUSTOMER",
                        request.getId()
                );

                return;
            }


            // No price difference
            request.setFinancialProcessed(true);
            request.setStatus(ReturnStatus.PROCESSING);

            return;
        }

        // ===== NORMAL RETURN =====
        if (request.getRefundAmount() == null) {
            request.setRefundAmount(BigDecimal.ZERO);
        }

        request.setFinancialProcessed(false);
        request.setStatus(ReturnStatus.WAITING_BANK_INFO);

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_BANK_INFO_REQUIRED,
                "RETURN_BANK_INFO_CUSTOMER",
                request.getId()
        );
    }

    // Customer confirms additional payment for exchange.
    public ReturnRequest confirmAdditionalPayment(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.WAITING_PAYMENT) {
            throw new IllegalStateException(
                    "Yêu cầu không ở trạng thái chờ thanh toán"
            );
        }

        request.setFinancialProcessed(true);
        request.setStatus(ReturnStatus.PROCESSING);

        return request;
    }

    // Creates exchange order from all exchange products.
    private void createExchangeOrder(ReturnRequest request) {

        Order newOrder = new Order();

        newOrder.setUser(request.getCustomer());
        newOrder.setShippingAddress(request.getOrder().getShippingAddress());
        newOrder.setShippingFee(BigDecimal.ZERO);
        newOrder.setDiscount(BigDecimal.ZERO);
        newOrder.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        newOrder.setStatus(OrderStatus.PROCESSING);

        List<OrderDetail> details = new ArrayList<>();

        for (ReturnExchangeProduct exchange : request.getExchangeProducts()) {

            OrderDetail detail = new OrderDetail();

            detail.setOrder(newOrder);
            detail.setProduct(exchange.getProduct());
            detail.setQuantity(exchange.getQuantity());
            detail.setPricePaid(exchange.getProduct().getPrice());

            details.add(detail);
        }

        newOrder.setOrderDetailList(details);

        orderRepository.save(newOrder);
    }

    public List<ReturnRequest> getCustomerRequests(String customerId) {
        return returnRequestRepository
                .findByCustomer_IdOrderByCreatedAtDesc(Long.parseLong(customerId));
    }

    public List<ReturnRequest> getApprovedRequests(String customerId) {

        return returnRequestRepository
                .findByCustomer_IdAndStatusNotInOrderByCreatedAtDesc(
                        Long.parseLong(customerId),
                        List.of(
                                ReturnStatus.REJECTED,
                                ReturnStatus.COMPLETED
                        )
                );
    }

    //MANAGER REPORT
    public ReturnReportDTO getReturnReport() {

        long totalRequests = returnRequestRepository.count();

        long completedReturns = returnRequestRepository.countByStatus(
                ReturnStatus.COMPLETED
        );

        long rejectedRequests = returnRequestRepository.countByStatus(
                ReturnStatus.REJECTED
        );

        BigDecimal refundAmount =
                returnRequestRepository.sumRefundAmountByStatus(
                        ReturnStatus.COMPLETED
                );

        BigDecimal additionalPayment =
                returnRequestRepository.sumAdditionalPaymentByStatus(
                        ReturnStatus.COMPLETED
                );

        if (refundAmount == null) {
            refundAmount = BigDecimal.ZERO;
        }

        if (additionalPayment == null) {
            additionalPayment = BigDecimal.ZERO;
        }

        BigDecimal revenueImpact = additionalPayment.subtract(refundAmount);

        return new ReturnReportDTO(
                totalRequests,
                completedReturns,
                rejectedRequests,
                refundAmount,
                additionalPayment,
                revenueImpact
        );
    }

    public List<ReturnRequest> getAllRequests() {
        return returnRequestRepository.findAll();
    }


    //REFUND INFORMATION
    public ReturnRequest submitBankInfo(String id, RefundInfoDTO dto) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.WAITING_BANK_INFO) {
            throw new IllegalStateException(
                    "Yêu cầu không ở trạng thái chờ thông tin ngân hàng"
            );
        }
        request.setBankName(dto.getBankName());
        request.setAccountNumber(dto.getAccountNumber());
        request.setAccountHolder(dto.getAccountHolder());

        request.setStatus(ReturnStatus.PROCESSING);
        notificationService.notifyRoleByTemplate(
                "MANAGER",
                NotificationType.RETURN_BANK_INFO_SUBMITTED,
                "RETURN_BANK_INFO_SUBMITTED_MANAGER",
                request.getId()
        );

        return returnRequestRepository.save(request);
    }


    // Manager completes request.
    public void completeByManager(String id) {

        ReturnRequest request = getRequestDetail(id);

        if (request.getStatus() != ReturnStatus.PROCESSING) {
            throw new IllegalStateException(
                    "Chỉ có thể hoàn tất khi đang xử lý"
            );
        }

        if (request.getRefundAmount() == null) {
            request.setRefundAmount(BigDecimal.ZERO);
        }

        if (request.getAdditionalPayment() == null) {
            request.setAdditionalPayment(BigDecimal.ZERO);
        }


        // Create exchange order only after Manager confirms completion.
        if (request.getReturnType() == ReturnType.EXCHANGE) {

            createExchangeOrder(request);
        }


        request.setFinancialProcessed(true);
        request.setStatus(ReturnStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());

        notificationService.notifyUserByTemplate(
                request.getCustomer().getId(),
                NotificationType.RETURN_COMPLETED,
                "RETURN_COMPLETED_CUSTOMER",
                request.getId()
        );
    }
    private String buildPaymentQrUrl(
            BigDecimal amount,
            String transferContent
    ) {

        String money = amount
                .stripTrailingZeros()
                .toPlainString();

        return "https://img.vietqr.io/image/"
                + encodePath(bankId.trim())
                + "-"
                + encodePath(bankAccountNo.trim())
                + "-"
                + encodePath(qrTemplate.trim())
                + ".png?amount="
                + encodeQuery(money)
                + "&addInfo="
                + encodeQuery(transferContent)
                + "&accountName="
                + encodeQuery(bankAccountName.trim());
    }
    private String encodeQuery(String value) {
        return URLEncoder.encode(
                value,
                StandardCharsets.UTF_8
        );
    }


    private String encodePath(String value) {
        return encodeQuery(value)
                .replace("+", "%20");
    }

    public Map<String, Object> getPaymentInfo(String requestId) {

        ReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Return request not found"
                        )
                );

        BigDecimal amount = request.getAdditionalPayment();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "No additional payment required."
            );
        }

        String transferContent = "TS_RETURN_" + request.getId();

        Map<String, Object> response = new HashMap<>();

        response.put(
                "additionalPayment",
                amount
        );

        response.put(
                "qrImageUrl",
                buildPaymentQrUrl(
                        amount,
                        transferContent
                )
        );

        response.put(
                "bankAccountNumber",
                bankAccountNo
        );

        response.put(
                "bankAccountName",
                bankAccountName
        );

        response.put(
                "transferContent",
                transferContent
        );

        return response;
    }
}