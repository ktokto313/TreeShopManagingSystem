package swp391.group6.service;

import org.junit.jupiter.api.Test;
import swp391.group6.dto.ProductRequest;
import swp391.group6.repository.CategoryRepository;
import swp391.group6.repository.ProductDetailRepository;
import swp391.group6.repository.ProductRepository;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class ProductServiceTest {

    @Test
    void createProductRejectsZeroPrice() {
        ProductRepository productRepository = mock(ProductRepository.class);
        CategoryRepository categoryRepository = mock(CategoryRepository.class);
        ProductDetailRepository productDetailRepository = mock(ProductDetailRepository.class);
        ProductService productService = new ProductService(productRepository, categoryRepository, productDetailRepository);

        ProductRequest request = validProductRequest();
        request.setPrice(BigDecimal.ZERO);

        assertTrue(productService.createProduct(request).isEmpty());
        verifyNoInteractions(categoryRepository, productRepository, productDetailRepository);
    }

    private ProductRequest validProductRequest() {
        ProductRequest request = new ProductRequest();
        request.setCategoryId(1L);
        request.setName("Valid product");
        request.setSku("VALID-001");
        request.setPrice(BigDecimal.ONE);
        request.setStock(1);
        request.setStatus(true);
        return request;
    }
}
