/*
 * Created By: MinhLTHE200133
 * Created At: 2026-05-30
 * Last Modified: 2026-07-03
 */
/*
 * Author: minhlthe200133
 * Created Date: 2026-05-30
 * Name: CategoryService.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-12
 */
package swp391.group6.service;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import swp391.group6.dto.CategoryRequest;
import swp391.group6.dto.CategoryResponse;
import swp391.group6.model.Category;
import swp391.group6.repository.CategoryRepository;
import swp391.group6.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private static final int MAX_NAME_LENGTH = 100;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<CategoryResponse> getCategory(Long id) {
        return categoryRepository.findById(id).map(this::toResponse);
    }

    /**
     * Returns the created category, or empty if the name already exists.
     */
    public Optional<CategoryResponse> createCategory(CategoryRequest request) {
        String name = normalizeName(request.getName());
        String description = trimToNull(request.getDescription());
        if (!isValidCategory(name, description)) {
            return Optional.empty();
        }
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            return Optional.empty();
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return Optional.of(toResponse(categoryRepository.save(category)));
    }

    /**
     * Returns the updated category, or empty if not found or name conflict.
     */
    public Optional<CategoryResponse> updateCategory(Long id, CategoryRequest request) {
        Optional<Category> existing = categoryRepository.findById(id);
        if (existing.isEmpty()) {
            return Optional.empty();
        }
        String name = normalizeName(request.getName());
        String description = trimToNull(request.getDescription());
        if (!isValidCategory(name, description)) {
            return Optional.empty();
        }
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            return Optional.empty();
        }
        Category category = existing.get();
        category.setName(name);
        category.setDescription(description);
        return Optional.of(toResponse(categoryRepository.save(category)));
    }

    /**
     * Returns true if deleted, false if not found, null if it has products.
     */
    public boolean deleteCategory(Long id) {
        Optional<Category> existing = categoryRepository.findById(id);
        if (existing.isEmpty() || productRepository.existsByCategoryId(id)) {
            return false;
        }
        categoryRepository.delete(existing.get());
        return true;
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setProductCount(productRepository.countByCategoryId(category.getId()));
        return response;
    }

    private String normalizeName(String name) {
        return trimToNull(name);
    }

    private boolean isValidCategory(String name, String description) {
        return name != null
                && name.length() <= MAX_NAME_LENGTH
                && (description == null || description.length() <= MAX_DESCRIPTION_LENGTH);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
