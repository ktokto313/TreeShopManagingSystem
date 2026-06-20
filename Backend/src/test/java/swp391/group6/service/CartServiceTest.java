package swp391.group6.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Product;
import swp391.group6.model.Role;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.User;
import swp391.group6.repository.ProductRepository;
import swp391.group6.repository.ShoppingCartRepository;
import swp391.group6.repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {
    @Mock
    private ShoppingCartRepository shoppingCartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartService(shoppingCartRepository, productRepository, userRepository);
    }

    @Test
    void getCart_createsCartWhenCustomerHasNone() {
        User customer = customer();
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.empty());
        when(shoppingCartRepository.save(any(ShoppingCart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShoppingCart cart = cartService.getOrCreateCart(login("CUSTOMER"));

        assertEquals(customer, cart.getCustomer());
        assertTrue(cart.getItems().isEmpty());
        verify(shoppingCartRepository).save(any(ShoppingCart.class));
    }

    @Test
    void addItem_addsNewProductLine() {
        User customer = customer();
        ShoppingCart cart = cart(customer);
        Product product = product(11L, true, 5);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(shoppingCartRepository.save(cart)).thenReturn(cart);

        ShoppingCart updated = cartService.addItem(login("CUSTOMER"), 11L, 2);

        assertEquals(1, updated.getItems().size());
        assertEquals(2, updated.getItems().get(0).getQuantity());
        assertEquals(product, updated.getItems().get(0).getProduct());
    }

    @Test
    void addItem_increasesExistingProductQuantity() {
        User customer = customer();
        Product product = product(11L, true, 5);
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product, 2));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));
        when(productRepository.findById(11L)).thenReturn(Optional.of(product));
        when(shoppingCartRepository.save(cart)).thenReturn(cart);

        ShoppingCart updated = cartService.addItem(login("CUSTOMER"), 11L, 3);

        assertEquals(1, updated.getItems().size());
        assertEquals(5, updated.getItems().get(0).getQuantity());
    }

    @Test
    void addItem_rejectsInvalidQuantity() {
        assertThrows(IllegalArgumentException.class, () -> cartService.addItem(login("CUSTOMER"), 11L, 0));
    }

    @Test
    void addItem_rejectsInactiveProduct() {
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer()));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart(customer())));
        when(productRepository.findById(11L)).thenReturn(Optional.of(product(11L, false, 5)));

        assertThrows(IllegalArgumentException.class, () -> cartService.addItem(login("CUSTOMER"), 11L, 1));
    }

    @Test
    void addItem_rejectsQuantityAboveStock() {
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer()));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart(customer())));
        when(productRepository.findById(11L)).thenReturn(Optional.of(product(11L, true, 2)));

        assertThrows(IllegalArgumentException.class, () -> cartService.addItem(login("CUSTOMER"), 11L, 3));
    }

    @Test
    void updateItem_rejectsMissingCartItem() {
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer()));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart(customer())));

        assertThrows(IllegalArgumentException.class, () -> cartService.updateItem(login("CUSTOMER"), 99L, 1));
    }

    @Test
    void removeItem_removesMatchingEntry() {
        User customer = customer();
        Product product = product(11L, true, 5);
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product, 2));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));
        when(shoppingCartRepository.save(cart)).thenReturn(cart);

        ShoppingCart updated = cartService.removeItem(login("CUSTOMER"), 11L);

        assertTrue(updated.getItems().isEmpty());
    }

    @Test
    void clearCart_removesAllEntries() {
        User customer = customer();
        ShoppingCart cart = cart(customer);
        cart.getItems().add(entry(cart, product(11L, true, 5), 2));
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customer));
        when(shoppingCartRepository.findByCustomer_Id(5L)).thenReturn(Optional.of(cart));
        when(shoppingCartRepository.save(cart)).thenReturn(cart);

        ShoppingCart updated = cartService.clearCart(login("CUSTOMER"));

        assertTrue(updated.getItems().isEmpty());
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
