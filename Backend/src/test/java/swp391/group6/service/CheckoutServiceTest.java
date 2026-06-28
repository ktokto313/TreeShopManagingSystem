package swp391.group6.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import swp391.group6.dto.CheckoutRequest;
import swp391.group6.dto.CheckoutResponse;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;
import swp391.group6.model.Product;
import swp391.group6.model.Role;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.User;
import swp391.group6.repository.OrderRepository;
import swp391.group6.repository.ProductRepository;
import swp391.group6.repository.ShoppingCartRepository;
import swp391.group6.repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {
    @Mock
    private ShoppingCartRepository shoppingCartRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    private CheckoutService checkoutService;

    @BeforeEach
    void setUp() {
        checkoutService = new CheckoutService(shoppingCartRepository, orderRepository, userRepository, productRepository);
        ReflectionTestUtils.setField(checkoutService, "bankId", "mbbank");
        ReflectionTestUtils.setField(checkoutService, "bankAccountNo", "123456789");
        ReflectionTestUtils.setField(checkoutService, "bankAccountName", "TREE SHOP");
        ReflectionTestUtils.setField(checkoutService, "qrTemplate", "compact2");
        ReflectionTestUtils.setField(checkoutService, "transferPrefix", "TS");
    }

    @Test
    void checkout_rejectsNonCustomerRole() {
        Role managerRole = new Role();
        managerRole.setName("MANAGER");
        User managerUser = new User();
        managerUser.setId(5L);
        managerUser.setEmail("customer@example.com");
        managerUser.setRole(managerRole);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(managerUser));

        assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout(login("MANAGER"), validRequest()));
    }

    @Test
    void checkout_rejectsEmptyCart() {
        User customer = customer();
        ShoppingCart cart = cart(customer);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));

        assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout(login("CUSTOMER"), validRequest()));
    }

    @Test
    void checkout_rejectsInvalidContactAddress() {
        CheckoutRequest request = validRequest();
        request.setPhone("");
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer()));

        assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout(login("CUSTOMER"), request));
    }

    @Test
    void checkout_rejectsInsufficientStock() {
        User customer = customer();
        Product product = product(11L, true, 1);
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product, 2));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));

        assertThrows(IllegalArgumentException.class, () -> checkoutService.checkout(login("CUSTOMER"), validRequest()));
    }

    @Test
    void checkout_createsProcessingOrderDeductsStockClearsCartAndReturnsQrData() {
        User customer = customer();
        Product product = product(11L, true, 5);
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product, 2));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(123L);
            return order;
        });
        when(shoppingCartRepository.save(cart)).thenReturn(cart);

        CheckoutResponse response = checkoutService.checkout(login("CUSTOMER"), validRequest());

        assertEquals(123L, response.getOrderId());
        assertEquals("TS123", response.getOrderCode());
        assertEquals(OrderStatus.PROCESSING, response.getStatus());
        assertEquals(0, BigDecimal.valueOf(230000).compareTo(response.getTotal()));
        assertEquals("TS123", response.getTransferContent());
        assertTrue(response.getQrImageUrl().contains("img.vietqr.io/image/mbbank-123456789-compact2.png"));
        assertTrue(response.getQrImageUrl().contains("amount=230000"));
        assertEquals(3, product.getStock());
        assertTrue(cart.getItems().isEmpty());
        verify(orderRepository).save(any(Order.class));
        verify(shoppingCartRepository).save(cart);
    }

    @Test
    void checkout_rejectsMissingQrConfig() {
        ReflectionTestUtils.setField(checkoutService, "bankAccountNo", "");
        User customer = customer();
        Product product = product(11L, true, 5);
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product, 1));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));

        assertThrows(IllegalStateException.class, () -> checkoutService.checkout(login("CUSTOMER"), validRequest()));
        assertFalse(cart.getItems().isEmpty());
    }

    private CheckoutRequest validRequest() {
        CheckoutRequest request = new CheckoutRequest();
        request.setFullName("Customer One");
        request.setEmail("customer@example.com");
        request.setPhone("0912345678");
        request.setProvince("Ho Chi Minh");
        request.setDistrict("District 1");
        request.setWard("Ben Nghe");
        request.setAddress("123 Nguyen Trai");
        request.setDeliveryNote("Call before delivery");
        return request;
    }

    private LoginResponse login(String role) {
        return new LoginResponse("customer@example.com", "Customer", role);
    }

    private User customer() {
        Role role = new Role();
        role.setName("CUSTOMER");
        User user = new User();
        user.setId(5L);
        user.setEmail("customer@example.com");
        user.setRole(role);
        return user;
    }

    private Product product(Long id, boolean status, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setName("Monstera");
        product.setPrice(BigDecimal.valueOf(100000));
        product.setStatus(status);
        product.setStock(stock);
        return product;
    }

    private ShoppingCart cart(User customer) {
        ShoppingCart cart = new ShoppingCart();
        cart.setId(1L);
        cart.setCustomer(customer);
        cart.setItems(new ArrayList<>());
        return cart;
    }

    private ShoppingCartEntry entry(ShoppingCart cart, Product product, int quantity) {
        ShoppingCartEntry entry = new ShoppingCartEntry();
        entry.setShoppingCart(cart);
        entry.setProduct(product);
        entry.setQuantity(quantity);
        return entry;
    }
}
