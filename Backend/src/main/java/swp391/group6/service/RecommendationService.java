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

    public List<RecommendationResponse> getRecommendations(RecommendationRequest request) {
        String spaceType = normalize(request.getSpaceType());
        String careDifficulty = normalize(request.getCareDifficulty());
        String fengShuiElement = normalize(request.getFengShuiElement());
        BigDecimal budget = request.getBudget() == null ? null : BigDecimal.valueOf(request.getBudget());

        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .filter(Product::isStatus)
                .filter(product -> product.getStock() > 0)
                .filter(product -> budget == null || product.getPrice().compareTo(budget) <= 0)
                .map(product -> toRecommendation(product, spaceType, careDifficulty, fengShuiElement, budget))
                .flatMap(Optional::stream)
                .sorted(
                        Comparator.comparingDouble(RecommendationResponse::getMatchScore).reversed()
                                .thenComparing(RecommendationResponse::getPrice, Comparator.nullsLast(Comparator.naturalOrder()))
                                .thenComparing(RecommendationResponse::getName, String.CASE_INSENSITIVE_ORDER)
                )
                .limit(MAX_RESULTS)
                .toList();
    }

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

    private ProductDetail resolveProductDetail(Product product) {
        if (product.getProductDetail() != null) {
            return product.getProductDetail();
        }
        return productDetailRepository.findByProduct_Id(product.getId()).orElse(null);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase(Locale.ROOT);
        return trimmed.isEmpty() ? null : trimmed;
    }

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
