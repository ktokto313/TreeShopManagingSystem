package swp391.group6.service;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import swp391.group6.dto.RecommendationRequest;
import swp391.group6.dto.RecommendationResponse;
import swp391.group6.model.Product;
import swp391.group6.model.ProductDetail;
import swp391.group6.repository.ProductDetailRepository;
import swp391.group6.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Service for generating product recommendations based on user preferences.
 * Uses a scoring algorithm that considers space type, care difficulty, feng shui elements, and budget.
 */
@Service
public class RecommendationService {
    private static final int MAX_RESULTS = 8;

    private final ProductRepository productRepository;
    private final ProductDetailRepository productDetailRepository;

    public RecommendationService(
            ProductRepository productRepository,
            ProductDetailRepository productDetailRepository
    ) {
        this.productRepository = productRepository;
        this.productDetailRepository = productDetailRepository;
    }

    /**
     * Generates product recommendations based on user preferences.
     * 
     * Scoring algorithm (max 100 points):
     * - Space type match: 40 points (if matched), or 10 points for category match
     * - Care difficulty match: 30 points (if matched), or 5 points if difficulty exists
     * - Feng shui element match: 20 points (if matched), or 5 points if element exists
     * - Budget match: up to 10 points based on price proximity
     * - Stock bonus: 0-10 points based on available stock (0.5 per unit, capped at 20 units)
     * 
     * @param request contains spaceType, careDifficulty, fengShuiElement, budget preferences
     * @return up to 8 products sorted by match score (descending), then by price and name
     */
    public List<RecommendationResponse> getRecommendations(RecommendationRequest request) {
        // Normalize input parameters (trim and lowercase)
        String spaceType = normalize(request.getSpaceType());
        String careDifficulty = normalize(request.getCareDifficulty());
        String fengShuiElement = normalize(request.getFengShuiElement());
        BigDecimal budget = request.getBudget() == null ? null : BigDecimal.valueOf(request.getBudget());

        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                // Filter: only active products with stock
                .filter(Product::isStatus)
                .filter(product -> product.getStock() > 0)
                // Filter: price must be within budget (if provided)
                .filter(product -> budget == null || product.getPrice().compareTo(budget) <= 0)
                // Score and convert to recommendations
                .map(product -> toRecommendation(product, spaceType, careDifficulty, fengShuiElement, budget))
                // Keep only products that matched at least one preference
                .flatMap(Optional::stream)
                // Sort by relevance: score (desc), price (asc), name (asc)
                .sorted(
                        Comparator.comparingDouble(RecommendationResponse::getMatchScore).reversed()
                                .thenComparing(RecommendationResponse::getPrice, Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(RecommendationResponse::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .limit(MAX_RESULTS)
                .toList();
    }

    /**
     * Converts a Product to a RecommendationResponse with scoring and filtering.
     * Returns empty if product doesn't match specified preferences.
     * 
     * Preference Matching Rules:
     * - If spaceType specified: must match category, name, or description
     * - If careDifficulty specified: must match difficulty or careGuide
     * - If fengShuiElement specified: must match element, category, or product name
     * 
     * @param product the product to evaluate
     * @param spaceType the space type preference (nullable)
     * @param careDifficulty the care difficulty preference (nullable)
     * @param fengShuiElement the feng shui element preference (nullable)
     * @param budget the maximum budget (nullable)
     * @return Optional containing recommendation with scores if matches, empty otherwise
     */
    private Optional<RecommendationResponse> toRecommendation(
            Product product,
            String spaceType,
            String careDifficulty,
            String fengShuiElement,
            BigDecimal budget
    ) {
        ProductDetail detail = resolveProductDetail(product);
        String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;

        if (spaceType != null && !matchesAny(spaceType, categoryName, product.getName(), product.getSku(),
                detail == null ? null : detail.getDescription(),
                detail == null ? null : detail.getContent())) {
            return Optional.empty();
        }

        if (careDifficulty != null && !matchesAny(careDifficulty,
                detail == null ? null : detail.getDifficulty(),
                detail == null ? null : detail.getCareGuide())) {
            return Optional.empty();
        }

        if (fengShuiElement != null && !matchesAny(fengShuiElement,
                detail == null ? null : detail.getFengShuiElement(),
                categoryName,
                product.getName())) {
            return Optional.empty();
        }

        RecommendationResponse response = new RecommendationResponse();
        response.setId(product.getId());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setCategoryName(categoryName);
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setStatus(product.isStatus());
        response.setSku(product.getSku());

        List<String> reasons = new ArrayList<>();
        double score = 0.0;

        if (detail != null) {
            response.setDescription(detail.getDescription());
            response.setContent(detail.getContent());
            response.setCareGuide(detail.getCareGuide());
            response.setSunlightLevel(detail.getSunlightLevel());
            response.setWateringFrequency(detail.getWateringFrequency());
            response.setDifficulty(detail.getDifficulty());
            response.setFengShuiElement(detail.getFengShuiElement());
            response.setImages(detail.getImages());
        }

        if (spaceType != null) {
            score += 40.0;
            reasons.add("Phù hợp không gian " + spaceType);
        } else if (categoryName != null) {
            score += 10.0;
            reasons.add("Thuộc danh mục " + categoryName);
        }

        if (careDifficulty != null) {
            score += 30.0;
            reasons.add("Mức chăm sóc phù hợp");
        } else if (detail != null && detail.getDifficulty() != null) {
            score += 5.0;
        }

        if (fengShuiElement != null) {
            score += 20.0;
            reasons.add("Hợp phong thủy " + fengShuiElement);
        } else if (detail != null && detail.getFengShuiElement() != null) {
            score += 5.0;
        }

        if (budget != null) {
            score += Math.max(0.0, 10.0 - priceDistanceScore(product.getPrice(), budget));
            reasons.add("Trong ngân sách");
        }

        score += Math.min(product.getStock(), 20) * 0.5;
        if (reasons.isEmpty()) {
            reasons.add("Sản phẩm đang hoạt động và còn hàng");
        }

        response.setMatchScore(score);
        response.setMatchReasons(reasons);
        return Optional.of(response);
    }

    /**
     * Retrieves ProductDetail for a product, checking product-level association first,
     * then falling back to repository lookup. This handles both eager-loaded and lazy-loaded details.
     *
     * @param product the product whose details to resolve
     * @return ProductDetail if found, null otherwise
     */
    private ProductDetail resolveProductDetail(Product product) {
        if (product.getProductDetail() != null) {
            return product.getProductDetail();
        }
        return productDetailRepository.findByProduct_Id(product.getId()).orElse(null);
    }

    /**
     * Normalizes preference strings for consistent matching: trims whitespace, converts to lowercase,
     * and returns null if the result is empty. This enables case-insensitive, whitespace-tolerant filtering.
     *
     * @param value the preference string to normalize (can be null)
     * @return normalized lowercase string, or null if value is null or empty after trim
     */
    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase(Locale.ROOT);
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Checks if any candidate text contains the keyword (case-insensitive substring match).
     * Returns true if keyword is null (no filtering required). Handles null candidates gracefully.
     *
     * This is used to match user preferences against product attributes (category, name, description, etc.).
     * For example, if keyword="small" and candidates contain "small bathroom", this returns true.
     *
     * @param keyword the search term (case-insensitive substring to match)
     * @param candidates the product attributes to check (null values are skipped)
     * @return true if any candidate contains the keyword, or if keyword is null
     */
    private boolean matchesAny(String keyword, String... candidates) {
        if (keyword == null) {
            return true;
        }

        for (String candidate : candidates) {
            if (candidate != null && candidate.toLowerCase(Locale.ROOT).contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Calculates a price match score (0-10 points) based on distance from budget.
     * Rewards prices within budget (0-10 points for 0% to 100% of budget),
     * and penalizes prices above budget (0 to -10 points for 0-100% over budget).
     *
     * Example scoring:
     * - Price = 100, Budget = 100 → score = 10 (perfect match)
     * - Price = 50, Budget = 100 → score = 5 (50% of budget)
     * - Price = 150, Budget = 100 → score = -5 (50% over budget)
     *
     * @param price the product price (cannot be null)
     * @param budget the user's budget (cannot be null or zero)
     * @return price distance score in range [-10, 10]
     */
    private double priceDistanceScore(BigDecimal price, BigDecimal budget) {
        if (price == null || budget == null || budget.signum() <= 0) {
            return 0.0;
        }

        double ratio = price.doubleValue() / budget.doubleValue();
        if (ratio <= 1.0) {
            return (1.0 - ratio) * 10.0;
        }
        return (ratio - 1.0) * 10.0;
    }
}
