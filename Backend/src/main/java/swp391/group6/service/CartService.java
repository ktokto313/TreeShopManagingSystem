/*
 * Author: lmd100
 * Created Date: 2026-06-20
 * Name: CartService.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-27
 */
package swp391.group6.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.CartDTO;
import swp391.group6.dto.CartItemDTO;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Product;
import swp391.group6.model.ProductDetail;
import swp391.group6.model.ShoppingCart;
import swp391.group6.model.ShoppingCartEntry;
import swp391.group6.model.ShoppingCartEntryId;
import swp391.group6.model.User;
import swp391.group6.repository.ProductRepository;
import swp391.group6.repository.ShoppingCartRepository;
import swp391.group6.repository.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class CartService {
    private final ShoppingCartRepository shoppingCartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            ShoppingCartRepository shoppingCartRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.shoppingCartRepository = shoppingCartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ShoppingCart getOrCreateCart(LoginResponse loginResponse) {
        User customer = resolveCustomer(loginResponse);
        return shoppingCartRepository.findByCustomer_Id(customer.getId())
                .map(this::ensureItems)
                .orElseGet(() -> {
                    ShoppingCart cart = new ShoppingCart();
                    cart.setCustomer(customer);
                    cart.setItems(new ArrayList<>());
                    return shoppingCartRepository.save(cart);
                });
    }

    @Transactional
    public ShoppingCart addItem(LoginResponse loginResponse, Long productId, Integer quantity) {
        int requestedQuantity = validateQuantity(quantity);
        ShoppingCart cart = getOrCreateCart(loginResponse);
        Product product = resolvePurchasableProduct(productId);
        ShoppingCartEntry existingEntry = findEntry(cart, productId);
        int nextQuantity = requestedQuantity + (existingEntry == null ? 0 : existingEntry.getQuantity());
        validateStock(product, nextQuantity);

        if (existingEntry == null) {
            ShoppingCartEntry entry = new ShoppingCartEntry();
            entry.setShoppingCart(cart);
            entry.setProduct(product);
            entry.setQuantity(nextQuantity);
            entry.setId(entryId(cart, product));
            cart.getItems().add(entry);
        } else {
            existingEntry.setQuantity(nextQuantity);
        }

        return shoppingCartRepository.save(cart);
    }

    @Transactional
    public ShoppingCart updateItem(LoginResponse loginResponse, Long productId, Integer quantity) {
        int nextQuantity = validateQuantity(quantity);
        ShoppingCart cart = getOrCreateCart(loginResponse);
        ShoppingCartEntry entry = findEntry(cart, productId);
        if (entry == null) {
            throw new IllegalArgumentException("Cart item was not found.");
        }

        Product product = resolvePurchasableProduct(productId);
        validateStock(product, nextQuantity);
        entry.setProduct(product);
        entry.setQuantity(nextQuantity);
        return shoppingCartRepository.save(cart);
    }

    @Transactional
    public ShoppingCart removeItem(LoginResponse loginResponse, Long productId) {
        ShoppingCart cart = getOrCreateCart(loginResponse);
        cart.getItems().removeIf((entry) -> entry.getProduct() != null
                && Long.valueOf(entry.getProduct().getId()).equals(productId));
        return shoppingCartRepository.save(cart);
    }

    @Transactional
    public ShoppingCart clearCart(LoginResponse loginResponse) {
        ShoppingCart cart = getOrCreateCart(loginResponse);
        cart.getItems().clear();
        return shoppingCartRepository.save(cart);
    }

    public CartDTO toDTO(ShoppingCart cart) {
        ShoppingCart safeCart = ensureItems(cart);
        CartDTO dto = new CartDTO();
        dto.setId(safeCart.getId());
        List<CartItemDTO> items = safeCart.getItems().stream()
                .filter((entry) -> entry.getProduct() != null)
                .sorted(Comparator.comparing((entry) -> entry.getProduct().getId()))
                .map(this::toItemDTO)
                .toList();
        dto.setItems(items);
        dto.setSubtotal(items.stream()
                .map(CartItemDTO::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setTotalQuantity(items.stream().mapToInt(CartItemDTO::getQuantity).sum());
        return dto;
    }

    private User resolveCustomer(LoginResponse loginResponse) {
        if (loginResponse == null || loginResponse.getEmail() == null) {
            throw new IllegalArgumentException("Authentication is required.");
        }
        return userRepository.findByEmail(loginResponse.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Customer account was not found."));
    }

    private Product resolvePurchasableProduct(Long productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product is required.");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product was not found."));
        if (!product.isStatus()) {
            throw new IllegalArgumentException("Product is not available.");
        }
        return product;
    }

    private int validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        return quantity;
    }

    private void validateStock(Product product, int quantity) {
        if (quantity > product.getStock()) {
            throw new IllegalArgumentException("Quantity exceeds available stock.");
        }
    }

    private ShoppingCart ensureItems(ShoppingCart cart) {
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        return cart;
    }

    private ShoppingCartEntry findEntry(ShoppingCart cart, Long productId) {
        if (productId == null) {
            return null;
        }
        return ensureItems(cart).getItems().stream()
                .filter((entry) -> entry.getProduct() != null
                        && Long.valueOf(entry.getProduct().getId()).equals(productId))
                .findFirst()
                .orElse(null);
    }

    private ShoppingCartEntryId entryId(ShoppingCart cart, Product product) {
        ShoppingCartEntryId id = new ShoppingCartEntryId();
        id.setShoppingCartId(cart.getId() > 0 ? cart.getId() : null);
        id.setProductId(product.getId());
        return id;
    }

    private CartItemDTO toItemDTO(ShoppingCartEntry entry) {
        Product product = entry.getProduct();
        BigDecimal price = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        CartItemDTO dto = new CartItemDTO();
        dto.setProductId(product.getId());
        dto.setName(product.getName());
        dto.setCategoryId(product.getCategory() == null ? null : product.getCategory().getId());
        dto.setPrice(price);
        dto.setStock(product.getStock());
        dto.setActive(product.isStatus());
        dto.setQuantity(entry.getQuantity());
        dto.setLineTotal(price.multiply(BigDecimal.valueOf(entry.getQuantity())));
        ProductDetail detail = product.getProductDetail();
        dto.setImages(detail == null ? null : detail.getImages());
        return dto;
    }
}
