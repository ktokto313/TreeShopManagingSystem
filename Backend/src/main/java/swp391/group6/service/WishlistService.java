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

    public boolean isWishlisted(String customerEmail, Long productId) {
        return userRepository.findByEmail(customerEmail)
                .map(User::getId)
                .filter(customerId -> productRepository.findById(productId).filter(Product::isStatus).isPresent()
                        && wishlistRepository.existsByCustomer_IdAndProduct_Id(customerId, productId))
                .isPresent();
    }

    @Transactional
    public void removeProduct(String customerEmail, Long productId) {
        userRepository.findByEmail(customerEmail)
                .map(User::getId)
                .ifPresent(customerId -> wishlistRepository.deleteByCustomer_IdAndProduct_Id(customerId, productId));
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
}
