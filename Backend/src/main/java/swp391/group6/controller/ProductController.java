/*
 * Author: minhlthe200133
 * Created Date: 2026-05-30
 * Name: ProductController.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-27
 */
package swp391.group6.controller;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import swp391.group6.dto.ProductRequest;
import swp391.group6.dto.ProductResponse;
import swp391.group6.dto.ReviewRequest;
import swp391.group6.dto.HomepageFeaturedResponse;
import swp391.group6.model.Product;
import swp391.group6.model.Review;
import swp391.group6.service.ProductImageStorageService;
import swp391.group6.service.ProductService;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final ProductImageStorageService productImageStorageService;

    public ProductController(ProductService productService, ProductImageStorageService productImageStorageService) {
        this.productService = productService;
        this.productImageStorageService = productImageStorageService;
    }

    /**
     * Lists all products with optional filtering by keyword, category, or status.
     * 
     * @param keyword optional search keyword (matches name, SKU, description, content, care info)
     * @param categoryId optional category ID filter
     * @param status optional status filter (true for active, false for inactive)
     * @return list of ProductResponse objects matching the criteria
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> listProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean status) {
        List<ProductResponse> products = productService.listProducts(keyword, categoryId, status);
        return ResponseEntity.ok(products);
    }

    /**
     * Retrieves featured products for the homepage.
     * Typically returns newly added and recommended products for promotional display.
     * 
     * @return HomepageFeaturedResponse containing featured product lists
     */
    @GetMapping("/best-sellers")
    public ResponseEntity<HomepageFeaturedResponse> getBestSellers() {
        HomepageFeaturedResponse response = productService.getBestSellers();
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves a single product by ID with full details (description, care guide, images, etc.).
     * 
     * @param id the product ID
     * @return ProductResponse if found, 404 Not Found otherwise
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return productService.getProduct(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Creates a new product with the provided details and optional plant-specific fields.
     * Requires SYSTEM_ADMIN or MANAGER role.
     * 
     * @param request ProductRequest containing name, price, stock, category, and optional care details
     * @return 201 Created with ProductResponse if successful, 400 Bad Request if validation fails
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return productService.createProduct(request)
                .map(product -> ResponseEntity.status(HttpStatus.CREATED).body(product))
                .orElse(ResponseEntity.badRequest().build());
    }

    /**
     * Uploads product images and stores them in the filesystem.
     * Requires SYSTEM_ADMIN or MANAGER role.
     * 
     * Supported formats: JPEG, PNG, WebP (validated by ProductImageStorageService).
     * Maximum file size enforced by Spring multipart configuration.
     * 
     * @param files list of image files to upload
     * @return 201 Created with list of stored filenames if successful, 400 Bad Request if upload fails
     */
    @PostMapping("/images")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<List<String>> uploadProductImages(@RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> storedFileNames = productImageStorageService.storeAll(files);
            if (storedFileNames.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(storedFileNames);
        } catch (IllegalArgumentException | IOException exception) {
            log.error("Image upload failed: {}", exception.getMessage(), exception);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Updates an existing product with new details and optional plant-specific fields.
     * Requires SYSTEM_ADMIN or MANAGER role.
     * 
     * Note: Existing images are preserved unless explicitly replaced in the request.
     * 
     * @param id the product ID to update
     * @param request ProductRequest with updated fields
     * @return 200 OK with updated ProductResponse if successful, 404 Not Found if product doesn't exist
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Soft-deletes a product by deactivating it (sets status to false).
     * The product record remains in the database for historical tracking but won't appear in public listings.
     * Requires SYSTEM_ADMIN or MANAGER role.
     * 
     * @param id the product ID to deactivate
     * @return 204 No Content if successful, 404 Not Found if product doesn't exist
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productService.deactivateProduct(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Serves product image files from disk.
     * Maps requests from /api/products/images/{filename} to stored image files.
     * 
     * @param filename the name of the image file to serve
     * @return the image file with appropriate content type, or 404 if not found
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            // Prevent directory traversal attacks
            if (filename.contains("..") || filename.contains("/")) {
                return ResponseEntity.badRequest().build();
            }

            java.nio.file.Path imagePath = productImageStorageService.getImageDirectory().resolve(filename).normalize();
            
            // Verify the resolved path is within the intended directory
            if (!imagePath.startsWith(productImageStorageService.getImageDirectory())) {
                return ResponseEntity.badRequest().build();
            }

            if (!java.nio.file.Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(imagePath);
            
            // Determine media type based on file extension
            MediaType mediaType = determineMediaType(filename);
            
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);
        } catch (Exception e) {
            log.error("Error serving image: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Determines the appropriate media type based on file extension.
     * 
     * @param filename the image filename
     * @return the MediaType for the file
     */
    private MediaType determineMediaType(String filename) {
        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (lowerFilename.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        } else if (lowerFilename.endsWith(".webp")) {
            return new MediaType("image", "webp");
        }
        return MediaType.IMAGE_PNG; // Default to PNG
    }

}
