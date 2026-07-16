/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: CheckoutService.java
 * Description:
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-27
 */
package swp391.group6.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.CheckoutRequest;
import swp391.group6.dto.CheckoutResponse;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ShippingFeeRequest;
import swp391.group6.model.Order;
import swp391.group6.model.OrderDetail;
import swp391.group6.model.OrderStatus;
import swp391.group6.model.Product;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.User;
import swp391.group6.model.NotificationType;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.ProductRepository;
import swp391.group6.repository.ShoppingCartRepository;
import swp391.group6.repository.UserRepository;
import swp391.group6.service.viettelpost.ViettelPostProperties;
import swp391.group6.service.viettelpost.ViettelPostService;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class CheckoutService {
    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);
    private static final BigDecimal DISCOUNT = BigDecimal.ZERO;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{8,10}$");

    private final ShoppingCartRepository shoppingCartRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService; // added for checkout notification triggers
    private final ViettelPostService viettelPostService;
    private final ViettelPostProperties viettelPostProperties;

    @Value("${checkout.bank-id:${CHECKOUT_BANK_ID:}}")
    private String bankId;

    @Value("${checkout.bank-account-no:${CHECKOUT_BANK_ACCOUNT_NO:}}")
    private String bankAccountNo;

    @Value("${checkout.bank-account-name:${CHECKOUT_BANK_ACCOUNT_NAME:}}")
    private String bankAccountName;

    @Value("${checkout.qr-template:${CHECKOUT_QR_TEMPLATE:compact2}}")
    private String qrTemplate;

    @Value("${checkout.transfer-prefix:${CHECKOUT_TRANSFER_PREFIX:TS}}")
    private String transferPrefix;

    public CheckoutService(
            ShoppingCartRepository shoppingCartRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            NotificationService notificationService,
            ViettelPostService viettelPostService,
            ViettelPostProperties viettelPostProperties) {
        this.shoppingCartRepository = shoppingCartRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.viettelPostService = viettelPostService;
        this.viettelPostProperties = viettelPostProperties;
    }

    public BigDecimal resolveShippingFee(LoginResponse loginResponse, CheckoutRequest request) {
        int weightGrams = 1000;
        if (request.getWeightGrams() > 0) {
            weightGrams = request.getWeightGrams();
        }
        int districtId = viettelPostService.mapDistrictNameToId(request.getDistrict());

        int fee;
        if (viettelPostProperties.isEnabled()) {
            fee = viettelPostService.calculateShippingFee(districtId, weightGrams);
        } else {
            fee = viettelPostService.calculateFallbackFee(
                    request.getDistrict(),
                    request.getTotalOrderValue(),
                    request.getItemCount()
            );
        }
        return BigDecimal.valueOf(fee);
    }

    public BigDecimal resolveShippingFee(LoginResponse loginResponse, ShippingFeeRequest request) {
        int weightGrams = 1000;
        int districtId = viettelPostService.mapDistrictNameToId(request.getDistrict());
        log.info("resolveShippingFee: districtName='{}' -> districtId={}", request.getDistrict(), districtId);

        int fee;
        if (viettelPostProperties.isEnabled()) {
            fee = viettelPostService.calculateShippingFee(districtId, weightGrams);
        } else {
            fee = viettelPostService.calculateFallbackFee(
                    request.getDistrict(),
                    request.getTotalOrderValue(),
                    request.getItemCount()
            );
        }

        log.info("resolveShippingFee: RETURNED fee={}", fee);
        return BigDecimal.valueOf(fee);
    }

    @Transactional
    public CheckoutResponse checkout(LoginResponse loginResponse, CheckoutRequest request) {
        User customer = resolveCustomer(loginResponse);
        validateRequest(request);
        validateQrConfig();
        ShoppingCart cart = shoppingCartRepository.findByCustomer_Id(customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty."));
        List<ShoppingCartEntry> entries = cart.getItems() == null ? List.of() : cart.getItems();
        if (entries.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty.");
        }

        BigDecimal shippingFee = resolveShippingFee(loginResponse, request);
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();
        Order order = new Order();
        order.setUser(customer);
        order.setShipper(null);
        order.setShippingAddress(formatShippingAddress(request));
        order.setShippingFee(shippingFee);
        order.setDiscount(DISCOUNT);
        order.setCreatedAt(Timestamp.from(Instant.now()));
        order.setStatus(OrderStatus.PROCESSING);

        for (ShoppingCartEntry entry : entries) {
            Product product = entry.getProduct();
            validateCheckoutEntry(product, entry.getQuantity());
            BigDecimal price = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(entry.getQuantity())));

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(entry.getQuantity());
            detail.setPricePaid(price);
            details.add(detail);

            product.setStock(product.getStock() - entry.getQuantity());
            productRepository.save(product);
        }

        order.setOrderDetailList(details);
        Order savedOrder = orderRepository.save(order);
        String orderCode = transferPrefix.trim() + savedOrder.getId();
        BigDecimal total = subtotal.add(shippingFee).subtract(DISCOUNT);
        cart.getItems().clear();
        shoppingCartRepository.save(cart);

        // Notify the customer their order was placed, and Managers that a new order needs handling.
        notificationService.notifyUserByTemplate(
                customer.getId(),
                NotificationType.ORDER_CONFIRMATION,
                "ORDER_PLACED_CUSTOMER",
                savedOrder.getId()
        );
        notificationService.notifyRoleByTemplate(
                "MANAGER",
                NotificationType.NEW_ORDER_ALERT,
                "NEW_ORDER_MANAGER",
                savedOrder.getId()
        );

        CheckoutResponse response = new CheckoutResponse();
        response.setOrderId(savedOrder.getId());
        response.setOrderCode(orderCode);
        response.setSubtotal(subtotal);
        response.setShippingFee(shippingFee);
        response.setDiscount(DISCOUNT);
        response.setTotal(total);
        response.setStatus(savedOrder.getStatus());
        response.setTransferContent(orderCode);
        response.setBankAccountNumber(bankAccountNo.trim());
        response.setBankAccountName(bankAccountName.trim());
        response.setQrImageUrl(buildQrImageUrl(total, orderCode));
        return response;
    }

    private User resolveCustomer(LoginResponse loginResponse) {
        if (loginResponse == null || loginResponse.getEmail() == null) {
            throw new IllegalArgumentException("Authentication is required.");
        }
        return userRepository.findByEmail(loginResponse.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Customer account was not found."));
    }

    private void validateRequest(CheckoutRequest request) {
        if (request == null
                || isBlank(request.getFullName())
                || isBlank(request.getEmail())
                || isBlank(request.getPhone())
                || isBlank(request.getProvince())
                || isBlank(request.getDistrict())
                || isBlank(request.getWard())
                || isBlank(request.getAddress())) {
            throw new IllegalArgumentException("Delivery information is incomplete.");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            throw new IllegalArgumentException("Email is invalid.");
        }
        if (!PHONE_PATTERN.matcher(request.getPhone().trim()).matches()) {
            throw new IllegalArgumentException("Phone number is invalid.");
        }
    }

    private void validateCheckoutEntry(Product product, int quantity) {
        if (product == null) {
            throw new IllegalArgumentException("A cart product was not found.");
        }
        if (!product.isStatus()) {
            throw new IllegalArgumentException(product.getName() + " is not available.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        if (quantity > product.getStock()) {
            throw new IllegalArgumentException(product.getName() + " does not have enough stock.");
        }
    }

    private void validateQrConfig() {
        if (isBlank(bankId) || isBlank(bankAccountNo) || isBlank(bankAccountName)) {
            throw new IllegalStateException("Checkout QR bank configuration is missing.");
        }
    }

    private String formatShippingAddress(CheckoutRequest request) {
        StringBuilder builder = new StringBuilder();
        builder.append(trim(request.getFullName())).append(" | ")
                .append(trim(request.getPhone())).append(" | ")
                .append(trim(request.getEmail())).append(" | ")
                .append(trim(request.getAddress())).append(", ")
                .append(trim(request.getWard())).append(", ")
                .append(trim(request.getDistrict())).append(", ")
                .append(trim(request.getProvince()));
        if (!isBlank(request.getDeliveryNote())) {
            builder.append(" | Note: ").append(trim(request.getDeliveryNote()));
        }
        return builder.toString();
    }

    private String buildQrImageUrl(BigDecimal total, String transferContent) {
        String amount = total.stripTrailingZeros().toPlainString();
        return "https://img.vietqr.io/image/"
                + encodePath(bankId.trim()) + "-"
                + encodePath(bankAccountNo.trim()) + "-"
                + encodePath(qrTemplate.trim()) + ".png?amount="
                + encodeQuery(amount)
                + "&addInfo=" + encodeQuery(transferContent)
                + "&accountName=" + encodeQuery(bankAccountName.trim());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private String encodeQuery(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String encodePath(String value) {
        return encodeQuery(value).replace("+", "%20");
    }
}