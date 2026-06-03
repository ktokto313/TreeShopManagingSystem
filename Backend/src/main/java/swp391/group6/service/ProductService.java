package swp391.group6.service;

import org.springframework.stereotype.Service;
import swp391.group6.dto.ProductRequest;
import swp391.group6.dto.ProductResponse;
import swp391.group6.model.Category;
import swp391.group6.model.Product;
import swp391.group6.repository.CategoryRepository;
import swp391.group6.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ProductResponse> listProducts(String keyword, Long categoryId, Boolean status) {
        return productRepository.findAll().stream()
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

        if (name == null || sku == null || price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            return Optional.empty();
        }
        if (request.getCategoryId() != null && !categoryRepository.existsById(request.getCategoryId())) {
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

        if (name == null || sku == null || price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            return Optional.empty();
        }
        if (request.getCategoryId() != null && !categoryRepository.existsById(request.getCategoryId())) {
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
        return response;
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
}
