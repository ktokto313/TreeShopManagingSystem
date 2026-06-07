// Created by minhlthe200133
package swp391.group6;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import swp391.group6.service.ProductImageStorageService;

@Configuration
public class ProductImageResourceConfig implements WebMvcConfigurer {
    private final ProductImageStorageService productImageStorageService;

    public ProductImageResourceConfig(ProductImageStorageService productImageStorageService) {
        this.productImageStorageService = productImageStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/product-images/**")
                .addResourceLocations(productImageStorageService.getImageDirectory().toUri().toString());
    }
}
