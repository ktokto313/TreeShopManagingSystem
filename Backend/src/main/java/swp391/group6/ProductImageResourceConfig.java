/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-05
 * Last Modified: 2026-06-07
 */

package swp391.group6;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import swp391.group6.service.ProductImageStorageService;

/**
 * Spring configuration for serving static product images.
 * Maps the URL path "/product-images/**" to the actual file directory where images are stored.
 * 
 * This allows the frontend to request images via HTTP (e.g., /product-images/product-123.jpg)
 * and Spring will serve them from the configured file system location.
 */
@Configuration
public class ProductImageResourceConfig implements WebMvcConfigurer {
    private final ProductImageStorageService productImageStorageService;

    public ProductImageResourceConfig(ProductImageStorageService productImageStorageService) {
        this.productImageStorageService = productImageStorageService;
    }

    /**
     * Registers a resource handler for serving product images.
     * Maps HTTP requests to /product-images/** to the actual image storage directory.
     * 
     * @param registry the ResourceHandlerRegistry used to add resource handlers
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /product-images/** URLs to the actual image directory
        registry.addResourceHandler("/product-images/**")
                .addResourceLocations(productImageStorageService.getImageDirectory().toUri().toString());
    }
}
