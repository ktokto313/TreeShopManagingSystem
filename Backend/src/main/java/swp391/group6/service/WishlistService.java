/*
 * Author: minhlthe200133
 * Created Date: 2026-06-23
 * Name: WishlistService.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-23
 */
package swp391.group6.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.ProductResponse;
import swp391.group6.model.Product;
import swp391.group6.model.ProductDetail;
import swp391.group6.model.User;
import swp391.group6.model.WishlistItem;
import swp391.group6.model.WishlistItemId;
import swp391.group6.repository.ProductDetailRepository;
import swp391.group6.repository.ProductRepository;
import swp391.group6.repository.UserRepository;
import swp391.group6.repository.WishlistRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing user wishlists.
 * Handles listing, adding, and removing products from a user's wishlist.
 * All operations are scoped to the authenticated user identified by email.
 * 
 * Only active products (status=true) are included in wishlists.
 * Multiple wishlist operations use transactional semantics to ensure consistency.
 */
@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductDetailRepository productDetailRepository
    ) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productDetailRepository = productDetailRepository;
    }

    /**
     * Retrieves all wishlisted products for a customer, sorted by product ID.
     * Only includes active products (status=true).
     * 
     * @param customerEmail the email of the customer
     * @return list of ProductResponse objects in the wishlist, or empty list if customer not found
     */
    public List<ProductResponse> listProducts(String customerEmail) {
        return userRepository.findByEmail(customerEmail)
                .map(User::getId)
                .map(customerId -> wishlistRepository.findByCustomer_IdOrderByProduct_IdAsc(customerId)
                        .stream()
                        .map(WishlistItem::getProduct)
                        .filter(Product::isStatus)
                        .map(this::toResponse)
                        .toList())
                .orElse(List.of());
    }

    /**
     * Adds a product to a customer's wishlist if not already present.
     * Only active products can be added. This is transactional to prevent race conditions.
     * 
     * @param customerEmail the email of the customer
     * @param productId the product ID to add to wishlist
     * @return ProductResponse if successful, empty Optional if customer or product not found
     */
    @Transactional
    public Optional<ProductResponse> addProduct(String customerEmail, Long productId) {
        Optional<User> user = userRepository.findByEmail(customerEmail);
        Optional<Product> product = productRepository.findById(productId).filter(Product::isStatus);

        if (user.isEmpty() || product.isEmpty()) {
            return Optional.empty();
        }

        Long customerId = user.get().getId();
        if (!wishlistRepository.existsByCustomer_IdAndProduct_Id(customerId, productId)) {
            WishlistItemId id = new WishlistItemId();
            id.setCustomerId(customerId);
            id.setProductId(productId);

            WishlistItem item = new WishlistItem();
            item.setId(id);
            item.setCustomer(user.get());
            item.setProduct(product.get());
            wishlistRepository.save(item);
        }

        return Optional.of(toResponse(product.get()));
    }

    /**
     * Checks if a product is wishlisted by a customer.
     * 
     * @param customerEmail the email of the customer
     * @param productId the product ID to check
     * @return true if the product is in the customer's wishlist and is active, false otherwise
     */
    public boolean isWishlisted(String customerEmail, Long productId) {
        return userRepository.findByEmail(customerEmail)
                .map(User::getId)
                .filter(customerId -> productRepository.findById(productId).filter(Product::isStatus).isPresent()
                        && wishlistRepository.existsByCustomer_IdAndProduct_Id(customerId, productId))
                .isPresent();
    }

    /**
     * Removes a product from a customer's wishlist.
     * This is transactional and safe to call even if the product is not in the wishlist.
     * 
     * @param customerEmail the email of the customer
     * @param productId the product ID to remove from wishlist
     */
    @Transactional
    public void removeProduct(String customerEmail, Long productId) {
        userRepository.findByEmail(customerEmail)
                .map(User::getId)
                .ifPresent(customerId -> wishlistRepository.deleteByCustomer_IdAndProduct_Id(customerId, productId));
    }

    /**
     * Converts a Product entity to a ProductResponse DTO with full details.
     * Includes all plant-specific fields (care guide, difficulty, feng shui, etc.) if available.
     * 
     * @param product the product to convert
     * @return ProductResponse DTO ready for API responses
     */
    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setCategoryId(product.getCategory().getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setStatus(product.isStatus());
        response.setSku(product.getSku());

        ProductDetail detail = resolveProductDetail(product);
        if (detail != null) {
            response.setDescription(detail.getDescription());
            response.setContent(detail.getContent());
            response.setCareGuide(detail.getCareGuide());
            response.setSunlightLevel(detail.getSunlightLevel());
            response.setWateringFrequency(detail.getWateringFrequency());
            response.setDifficulty(detail.getDifficulty());
            response.setFengShuiElement(detail.getFengShuiElement());
            response.setImages(detail.getImages());
        }

        return response;
    }

    /**
     * Retrieves ProductDetail for a product, checking product-level association first,
     * then falling back to repository lookup. Handles both eager-loaded and lazy-loaded details.
     * 
     * @param product the product whose details to resolve
     * @return ProductDetail if found, null otherwise
     */
    private ProductDetail resolveProductDetail(Product product) {
        if (product.getProductDetail() != null) {
            return product.getProductDetail();
        }
        return productDetailRepository.findByProduct_Id(product.getId()).orElse(null);
    }
}
