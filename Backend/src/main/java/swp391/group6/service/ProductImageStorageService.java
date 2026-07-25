/*
 * Author: minhlthe200133
 * Created Date: 2026-06-05
 * Name: ProductImageStorageService.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-07
 */
package swp391.group6.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ProductImageStorageService {
    private static final int MAX_IMAGE_FILES = 5;
    private static final long MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

    private final Path imageDirectory;

    public ProductImageStorageService(
            @Value("${treeshop.product-images.directory:}") String configuredDirectory) {
        // If no config is provided, use Frontend folder (relative path works in both Docker and local)
        if (configuredDirectory == null || configuredDirectory.isBlank()) {
            this.imageDirectory = Path.of("Frontend", "src", "features", "products", "images")
                    .toAbsolutePath().normalize();
        } else {
            this.imageDirectory = Path.of(configuredDirectory).toAbsolutePath().normalize();
        }
    }

    public Path getImageDirectory() {
        return imageDirectory;
    }

    /**
     * Stores multiple image files to disk.
     * Validates file count and creates the image directory if it doesn't exist.
     * 
     * @param files list of MultipartFile objects to store (max 5 files)
     * @return list of stored file names (sanitized and unique)
     * @throws IOException if file storage fails or directory cannot be created
     * @throws IllegalArgumentException if file count exceeds MAX_IMAGE_FILES or list is null
     */
    public List<String> storeAll(List<MultipartFile> files) throws IOException {
        if (files == null || files.size() > MAX_IMAGE_FILES) {
            throw new IllegalArgumentException("Invalid image file count");
        }

        // Ensure image directory exists
        Files.createDirectories(imageDirectory);

        List<String> storedFileNames = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            storedFileNames.add(store(file));
        }
        return storedFileNames;
    }

    /**
     * Stores a single image file to disk.
     * Sanitizes filename, ensures uniqueness, and validates security.
     * 
     * @param file the MultipartFile to store
     * @return the stored file name (sanitized and unique)
     * @throws IOException if file storage fails or security check fails
     */
    private String store(MultipartFile file) throws IOException {
        validateImage(file);

        // Sanitize and ensure unique filename
        String fileName = ensureUniqueFileName(sanitizeFileName(file.getOriginalFilename()));
        Path destination = imageDirectory.resolve(fileName).normalize();
        
        // Security check: ensure the resolved path is within the intended directory
        if (!destination.startsWith(imageDirectory)) {
            throw new IOException("Invalid image path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        return fileName;
    }

    /**
     * Validates that the uploaded file is a valid image.
     * Checks content type and file size.
     * 
     * @param file the MultipartFile to validate
     * @throws IllegalArgumentException if file is not an image or exceeds size limit
     */
    private void validateImage(MultipartFile file) {
        String contentType = file.getContentType();
        
        // Check content type is image/*
        if (contentType != null && !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image files can be uploaded");
        }
        
        // Check file size doesn't exceed limit
        if (file.getSize() > MAX_IMAGE_FILE_SIZE) {
            throw new IllegalArgumentException("Image file is too large");
        }
    }

    /**
     * Sanitizes the filename to prevent security issues.
     * Removes special characters and spaces, converts to lowercase for consistency.
     * Returns a safe default if the sanitized name is empty.
     * 
     * @param originalName the original filename from the uploaded file
     * @return a sanitized filename safe for file storage (lowercase, no spaces/special chars)
     */
    private String sanitizeFileName(String originalName) {
        String fileName = originalName == null ? "" : Path.of(originalName).getFileName().toString();
        
        // Convert to lowercase for consistency
        fileName = fileName.toLowerCase(Locale.ROOT);
        
        // Replace spaces and special characters with hyphens
        String sanitized = fileName.replaceAll("[^a-z0-9._-]", "-");
        
        // Collapse multiple consecutive hyphens into one
        sanitized = sanitized.replaceAll("-+", "-");
        
        // Remove leading/trailing hyphens
        sanitized = sanitized.replaceAll("^-+|-+$", "");

        // Use default name if result is empty or invalid
        if (sanitized.isBlank() || sanitized.equals(".") || sanitized.equals("..")) {
            return "product-image";
        }
        return sanitized;
    }

    /**
     * Ensures the filename is unique by appending a counter if the file already exists.
     * Preserves the file extension when appending numbers.
     * 
     * @param fileName the base filename to ensure uniqueness for
     * @return a unique filename that doesn't conflict with existing files
     * @throws IOException if file system access fails
     */
    private String ensureUniqueFileName(String fileName) throws IOException {
        String baseName = fileName;
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');

        // Split filename and extension
        if (dotIndex > 0) {
            baseName = fileName.substring(0, dotIndex);
            extension = fileName.substring(dotIndex);
        }

        String candidate = fileName;
        int counter = 1;
        
        // Keep incrementing counter until we find a unique name
        while (Files.exists(imageDirectory.resolve(candidate))) {
            candidate = "%s-%d%s".formatted(baseName, counter, extension);
            counter++;
        }
        return candidate;
    }
}
