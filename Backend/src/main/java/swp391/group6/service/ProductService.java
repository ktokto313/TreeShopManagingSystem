// Created by minhlthe200133
package swp391.group6.service;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import swp391.group6.dto.ProductRequest;
import swp391.group6.dto.ProductResponse;
import swp391.group6.dto.ReviewRequest;
import swp391.group6.model.*;
import swp391.group6.repository.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ProductService {
    private static final int MAX_NAME_LENGTH = 200;
    private static final int MAX_SKU_LENGTH = 50;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;
    private static final Pattern SKU_PATTERN = Pattern.compile("[A-Za-z0-9_-]+");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductDetailRepository productDetailRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository; // 1. Add this!
    private final OrderRepository orderRepository;

    // 2. Add UserRepository to your constructor
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductDetailRepository productDetailRepository,
                          ReviewRepository reviewRepository,
                          UserRepository userRepository,
                          OrderRepository orderRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productDetailRepository = productDetailRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public List<ProductResponse> listProducts(String keyword, Long categoryId, Boolean status) {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .filter(product -> keyword == null
                        || keyword.isEmpty()
                        || containsIgnoreCase(product.getName(), keyword)
                        || containsIgnoreCase(product.getSku(), keyword))
                .filter(product -> categoryId == null || categoryId.equals(product.getCategory().getId()))
                .filter(product -> status == null || status.equals(product.isStatus()))
                .map(this::toResponse)
                .toList();
    }

    public Optional<ProductResponse> getProduct(Long id) {
        return productRepository.findById(id).map(this::toResponse);
    }

    /**
     * Returns the created product, or empty if validation fails or SKU already exists.
     */
    public Optional<ProductResponse> createProduct(ProductRequest request) {
        String name = trimToNull(request.getName());
        String sku = trimToNull(request.getSku());
        BigDecimal price = request.getPrice();

        if (!isValidProductRequest(request, name, sku, price)) {
            return Optional.empty();
        }
        if (!categoryRepository.existsById(request.getCategoryId())) {
            return Optional.empty();
        }
        if (productRepository.existsBySkuIgnoreCase(sku)) {
            return Optional.empty();
        }

        Product product = new Product();
        applyRequest(product, request, name, sku, price);
        return Optional.of(toResponse(productRepository.save(product)));
    }

    /**
     * Returns the updated product, or empty if not found, validation fails, or SKU conflict.
     */
    public Optional<ProductResponse> updateProduct(Long id, ProductRequest request) {
        Optional<Product> existing = productRepository.findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }

        String name = trimToNull(request.getName());
        String sku = trimToNull(request.getSku());
        BigDecimal price = request.getPrice();

        if (!isValidProductRequest(request, name, sku, price)) {
            return Optional.empty();
        }
        if (!categoryRepository.existsById(request.getCategoryId())) {
            return Optional.empty();
        }
        if (productRepository.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
            return Optional.empty();
        }

        Product product = existing.get();
        applyRequest(product, request, name, sku, price);
        product.setId(id);
        return Optional.of(toResponse(productRepository.save(product)));
    }

    /**
     * Returns true if deactivated, false if not found.
     */
    public boolean deactivateProduct(Long id) {
        Optional<Product> existing = productRepository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        Product product = existing.get();
        product.setStatus(false);
        productRepository.save(product);
        return true;
    }

    private void applyRequest(Product product, ProductRequest request, String name, String sku, BigDecimal price) {
        Category category = new Category();
        category.setId(request.getCategoryId());
        product.setCategory(category);
        product.setName(name);
        product.setPrice(price);
        product.setStock(request.getStock() == null ? 0 : request.getStock());
        product.setStatus(request.getStatus() == null || request.getStatus());
        product.setSku(sku);

        String description = trimToNull(request.getDescription());
        String variants = trimToNull(request.getVariants());
        String images = trimToNull(request.getImages());
        boolean hasDetail = description != null || variants != null || images != null;

        ProductDetail detail = product.getProductDetail();
        if (detail == null && hasDetail) {
            detail = new ProductDetail();
            detail.setProduct(product);
        }

        if (detail != null) {
            detail.setProduct(product);
            detail.setDescription(description);
            detail.setVariants(variants);
            detail.setImages(images);
            product.setProductDetail(detail);
        } else {
            product.setProductDetail(null);
        }
    }

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
            response.setVariants(detail.getVariants());
            response.setImages(detail.getImages());
        }
        return response;
    }

    private ProductDetail resolveProductDetail(Product product) {
        if (product.getProductDetail() != null) {
            return product.getProductDetail();
        }
        return productDetailRepository.findByProduct_Id(product.getId()).orElse(null);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && keyword != null && value.toLowerCase().contains(keyword.toLowerCase());
    }

    private boolean isValidProductRequest(ProductRequest request, String name, String sku, BigDecimal price) {
        String description = trimToNull(request.getDescription());
        Integer stock = request.getStock();

        return request.getCategoryId() != null
                && name != null
                && name.length() <= MAX_NAME_LENGTH
                && sku != null
                && sku.length() <= MAX_SKU_LENGTH
                && SKU_PATTERN.matcher(sku).matches()
                && price != null
                && price.compareTo(BigDecimal.ZERO) > 0
                && stock != null
                && stock >= 0
                && (description == null || description.length() <= MAX_DESCRIPTION_LENGTH);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProduct_Id(productId);
    }

    public Review createProductReview(ReviewRequest request) {
        Review review = new Review();

        User user = userRepository.findById(request.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUser().getId()));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        List<Order> pastOrders = orderRepository.findOrdersByUserAndProduct(request.getUser().getId(), request.getProductId());

        if (pastOrders.isEmpty()) {
            throw new RuntimeException("User cannot review a product they did not purchase.");
        }

        Order order = pastOrders.get(0);

        // 4. Set the actual objects into the review
        review.setUser(user);
        review.setProduct(product);
        review.setOrder(order);
        review.setComment(request.getComment());
        review.setRating((short) request.getRating());
        review.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return reviewRepository.save(review);
    }
}
