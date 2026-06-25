package swp391.group6.dto;

import swp391.group6.model.OrderDetail;
import java.math.BigDecimal;
import java.util.Map;

public class OrderDetailDTO {
    private Long productId;
    // Map product data to avoid infinite recursion and simplify frontend
    private Map<String, Object> product;
    private int quantity;
    private BigDecimal pricePaid;
    private boolean hasReviewed;

    public OrderDetailDTO() {}

    public OrderDetailDTO(OrderDetail detail, boolean hasReviewed) {
        this.productId = detail.getProduct().getId();
        this.product = Map.of(
            "id", detail.getProduct().getId(),
            "name", detail.getProduct().getName(),
            "sku", detail.getProduct().getSku()
        );
        this.quantity = detail.getQuantity();
        this.pricePaid = detail.getPricePaid();
        this.hasReviewed = hasReviewed;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Map<String, Object> getProduct() { return product; }
    public void setProduct(Map<String, Object> product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public BigDecimal getPricePaid() { return pricePaid; }
    public void setPricePaid(BigDecimal pricePaid) { this.pricePaid = pricePaid; }

    public boolean isHasReviewed() { return hasReviewed; }
    public void setHasReviewed(boolean hasReviewed) { this.hasReviewed = hasReviewed; }
}
