package swp391.group6.service;

import org.springframework.stereotype.Service;
import swp391.group6.dto.CategoryRequest;
import swp391.group6.dto.CategoryResponse;
import swp391.group6.model.Category;
import swp391.group6.repository.CategoryRepository;
import swp391.group6.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll()
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
        if (name == null) {
            return Optional.empty();
        }
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            return Optional.empty();
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(trimToNull(request.getDescription()));
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
        if (name == null) {
            return Optional.empty();
        }
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            return Optional.empty();
        }
        Category category = existing.get();
        category.setName(name);
        category.setDescription(trimToNull(request.getDescription()));
        return Optional.of(toResponse(categoryRepository.save(category)));
    }

    /**
     * Returns true if deleted, false if not found, null if it has products.
     */
    public Boolean deleteCategory(Long id) {
        Optional<Category> existing = categoryRepository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        if (productRepository.existsByCategoryId(id)) {
            return null;
        }
        categoryRepository.delete(existing.get());
        return true;
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        return response;
    }

    private String normalizeName(String name) {
        return trimToNull(name);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
