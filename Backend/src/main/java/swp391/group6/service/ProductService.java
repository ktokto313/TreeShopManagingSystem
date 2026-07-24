/*
 * Author: minhlthe200133
 * Created Date: 2026-05-30
 * Name: ProductService.java
 * Description:
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-25
 */
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import swp391.group6.dto.HomepageFeaturedResponse;
import swp391.group6.dto.BestSellingProductDTO;

@Service
public class ProductService {
    private static final int MAX_NAME_LENGTH = 200;
    private static final int MAX_SKU_LENGTH = 50;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;
    private static final int MAX_LONG_TEXT_LENGTH = 1000;
    private static final int MAX_SHORT_TEXT_LENGTH = 255;
    private static final int MAX_CONTENT_LENGTH = 10000;
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

    /**
     * Lists all products filtered by keyword, category, and status.
     * 
     * @param keyword optional search keyword (matches product name or SKU, case-insensitive)
     * @param categoryId optional category ID to filter by
     * @param status optional status filter (true for active, false for inactive)
     * @return list of filtered products as ProductResponse objects
     */
    public List<ProductResponse> listProducts(String keyword, Long categoryId, Boolean status) {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                // Filter by keyword (matches name or SKU)
                .filter(product -> keyword == null
                        || keyword.isEmpty()
                        || containsIgnoreCase(product.getName(), keyword)
                        || containsIgnoreCase(product.getSku(), keyword))
                // Filter by category if specified
                .filter(product -> categoryId == null || categoryId.equals(product.getCategory().getId()))
                // Filter by status if specified
                .filter(product -> status == null || status.equals(product.isStatus()))
                .map(this::toResponse)
                .toList();
    }

    /**
     * Retrieves a single product by ID.
     * 
     * @param id the product ID
     * @return Optional containing the ProductResponse if found, empty if not
     */
    public Optional<ProductResponse> getProduct(Long id) {
        return productRepository.findById(id).map(this::toResponse);
    }

    /**
     * Fetches featured products for the homepage.
     * Strategy: First tries to get best-selling products from the current month.
     * If insufficient (< 4), falls back to all-time best sellers.
     * 
     * @return HomepageFeaturedResponse containing up to 4 products with title
     */
    public HomepageFeaturedResponse getHomepageFeaturedProducts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfMonth = now.withDayOfMonth(now.getMonth().length(now.toLocalDate().isLeapYear()))
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // Try to fetch this month's best sellers
        List<BestSellingProductDTO> topProducts = orderRepository.findBestSellingProducts(startOfMonth, endOfMonth, OrderStatus.RECEIVED);
        
        String title = "Sản Phẩm Bán Chạy Nhất Tháng Này";
        
        // If not enough products this month, use all-time best sellers
        if (topProducts.size() < 4) {
            LocalDateTime startOfAllTime = LocalDateTime.of(2000, 1, 1, 0, 0);
            topProducts = orderRepository.findBestSellingProducts(startOfAllTime, endOfMonth, OrderStatus.RECEIVED);
            title = "Sản Phẩm Bán Chạy Nhất Mọi Thời Đại";
        }
        
        // Convert DTOs to responses and limit to 4 products
        List<ProductResponse> products = topProducts.stream()
                .limit(4)
                .map(dto -> getProduct(dto.getProductId()).orElse(null))
                .filter(p -> p != null)
                .collect(Collectors.toList());
                
        return new HomepageFeaturedResponse(title, products);
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

    /**
     * Applies request data to a product entity, handling both basic and optional detail fields.
     * Creates a ProductDetail record if optional fields are provided, otherwise leaves it null.
     * 
     * @param product the product entity to update
     * @param request the ProductRequest DTO with new data
     * @param name sanitized product name (non-null)
     * @param sku sanitized product SKU (non-null)
     * @param price validated product price (non-null, > 0)
     */
    private void applyRequest(Product product, ProductRequest request, String name, String sku, BigDecimal price) {
        // Set basic product fields
        Category category = new Category();
        category.setId(request.getCategoryId());
        product.setCategory(category);
        product.setName(name);
        product.setPrice(price);
        product.setStock(request.getStock() == null ? 0 : request.getStock());
        product.setStatus(request.getStatus() == null || request.getStatus());
        product.setSku(sku);

        // Extract optional detail fields
        String description = trimToNull(request.getDescription());
        String content = trimToNull(request.getContent());
        String careGuide = trimToNull(request.getCareGuide());
        String sunlightLevel = trimToNull(request.getSunlightLevel());
        String wateringFrequency = trimToNull(request.getWateringFrequency());
        String difficulty = trimToNull(request.getDifficulty());
        String fengShuiElement = trimToNull(request.getFengShuiElement());
        
        // Convert images list to JSON string for storage
        String images = null;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Manually construct JSON array string to avoid dependency issues
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < request.getImages().size(); i++) {
                if (i > 0) sb.append(",");
                String img = request.getImages().get(i);
                // Escape quotes in filename
                String escaped = img.replace("\\", "\\\\").replace("\"", "\\\"");
                sb.append("\"").append(escaped).append("\"");
            }
            sb.append("]");
            images = sb.toString();
        }
        
        // Check if we have any detail fields to store
        boolean hasDetail = description != null
                || content != null
                || careGuide != null
                || sunlightLevel != null
                || wateringFrequency != null
                || difficulty != null
                || fengShuiElement != null
                || images != null;

        ProductDetail detail = product.getProductDetail();
        
        // Create ProductDetail only if we have optional fields to store
        if (detail == null && hasDetail) {
            detail = new ProductDetail();
            detail.setProduct(product);
        }

        // Update or clear the detail record
        if (detail != null) {
            detail.setProduct(product);
            detail.setDescription(description);
            detail.setContent(content);
            detail.setCareGuide(careGuide);
            detail.setSunlightLevel(sunlightLevel);
            detail.setWateringFrequency(wateringFrequency);
            detail.setDifficulty(difficulty);
            detail.setFengShuiElement(fengShuiElement);
            detail.setImages(images);
            product.setProductDetail(detail);
        } else {
            // No detail fields provided, clear any existing detail
            product.setProductDetail(null);
        }
    }

    /**
     * Converts a Product entity to a ProductResponse DTO.
     * Includes all basic product fields and optional detail fields if present.
     * 
     * @param product the Product entity to convert
     * @return ProductResponse DTO with all product data
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
        
        // Include optional detail fields if present
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
     * Resolves the ProductDetail for a given product.
     * Checks if detail is eagerly loaded, otherwise queries the repository.
     * 
     * @param product the Product entity
     * @return ProductDetail if it exists, null otherwise
     */
    private ProductDetail resolveProductDetail(Product product) {
        if (product.getProductDetail() != null) {
            return product.getProductDetail();
        }
        return productDetailRepository.findByProduct_Id(product.getId()).orElse(null);
    }

    /**
     * Trims whitespace from a string and returns null if empty.
     * Useful for normalizing optional user input.
     * 
     * @param value the string to trim
     * @return trimmed string, or null if empty/whitespace-only
     */
    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Checks if a string contains a keyword using case-insensitive comparison.
     * 
     * @param value the string to search in
     * @param keyword the keyword to search for
     * @return true if value contains keyword (case-insensitive), false otherwise
     */
    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && keyword != null && value.toLowerCase().contains(keyword.toLowerCase());
    }

    /**
     * Validates the entire ProductRequest against business rules and constraints.
     * Checks: category exists, name/SKU non-empty and within length limits,
     * price is positive, stock is non-negative, optional fields within length limits.
     * 
     * @param request the ProductRequest DTO to validate
     * @param name sanitized product name (result of trimToNull)
     * @param sku sanitized product SKU (result of trimToNull)
     * @param price the product price
     * @return true if all validations pass, false otherwise
     */
    private boolean isValidProductRequest(ProductRequest request, String name, String sku, BigDecimal price) {
        String description = trimToNull(request.getDescription());
        String content = trimToNull(request.getContent());
        String careGuide = trimToNull(request.getCareGuide());
        String sunlightLevel = trimToNull(request.getSunlightLevel());
        String wateringFrequency = trimToNull(request.getWateringFrequency());
        String difficulty = trimToNull(request.getDifficulty());
        String fengShuiElement = trimToNull(request.getFengShuiElement());
        Integer stock = request.getStock();

        // Validate all required and optional fields
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
                && (description == null || description.length() <= MAX_DESCRIPTION_LENGTH)
                && (content == null || content.length() <= MAX_CONTENT_LENGTH)
                && (careGuide == null || careGuide.length() <= MAX_LONG_TEXT_LENGTH)
                && (sunlightLevel == null || sunlightLevel.length() <= MAX_SHORT_TEXT_LENGTH)
                && (wateringFrequency == null || wateringFrequency.length() <= MAX_SHORT_TEXT_LENGTH)
                && (difficulty == null || difficulty.length() <= MAX_SHORT_TEXT_LENGTH)
                && (fengShuiElement == null || fengShuiElement.length() <= MAX_SHORT_TEXT_LENGTH);
    }

}
