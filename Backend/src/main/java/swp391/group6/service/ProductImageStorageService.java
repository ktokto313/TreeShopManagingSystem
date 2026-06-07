// Created by minhlthe200133
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
            @Value("${treeshop.product-images.directory:uploads/product-images}") String imageDirectory) {
        this.imageDirectory = Path.of(imageDirectory).toAbsolutePath().normalize();
    }

    public Path getImageDirectory() {
        return imageDirectory;
    }

    public List<String> storeAll(List<MultipartFile> files) throws IOException {
        if (files == null || files.size() > MAX_IMAGE_FILES) {
            throw new IllegalArgumentException("Invalid image file count");
        }

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

    private String store(MultipartFile file) throws IOException {
        validateImage(file);

        String fileName = ensureUniqueFileName(sanitizeFileName(file.getOriginalFilename()));
        Path destination = imageDirectory.resolve(fileName).normalize();
        if (!destination.startsWith(imageDirectory)) {
            throw new IOException("Invalid image path");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        return fileName;
    }

    private void validateImage(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image files can be uploaded");
        }
        if (file.getSize() > MAX_IMAGE_FILE_SIZE) {
            throw new IllegalArgumentException("Image file is too large");
        }
    }

    private String sanitizeFileName(String originalName) {
        String fileName = originalName == null ? "" : Path.of(originalName).getFileName().toString();
        String sanitized = fileName.replaceAll("[^A-Za-z0-9._-]", "-");
        sanitized = sanitized.replaceAll("-+", "-");

        if (sanitized.isBlank() || sanitized.equals(".") || sanitized.equals("..")) {
            return "product-image";
        }
        return sanitized;
    }

    private String ensureUniqueFileName(String fileName) throws IOException {
        String baseName = fileName;
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');

        if (dotIndex > 0) {
            baseName = fileName.substring(0, dotIndex);
            extension = fileName.substring(dotIndex);
        }

        String candidate = fileName;
        int counter = 1;
        while (Files.exists(imageDirectory.resolve(candidate))) {
            candidate = "%s-%d%s".formatted(baseName, counter, extension);
            counter++;
        }
        return candidate;
    }
}
