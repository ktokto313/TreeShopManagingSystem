package swp391.group6.dto;

import swp391.group6.model.OrderDetail;

import java.math.BigDecimal;

public class OrderDetailDTO {
    private int quantity;
    private BigDecimal pricePaid;
    private String productName;
    private String sku;
    private boolean hasReviewed;
    private Long productId;

    public OrderDetailDTO(OrderDetail orderDetail, boolean hasReviewed) {
        this.quantity = orderDetail.getQuantity();
        this.pricePaid = orderDetail.getPricePaid();
        this.productName = orderDetail.getProduct().getName();
        this.sku = orderDetail.getProduct().getSku();
        this.hasReviewed = hasReviewed;
        this.productId = orderDetail.getProduct().getId();
    }

    public OrderDetailDTO(int quantity, BigDecimal pricePaid) {
        this.quantity = quantity;
        this.pricePaid = pricePaid;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePaid() {
        return pricePaid;
    }

    public void setPricePaid(BigDecimal pricePaid) {
        this.pricePaid = pricePaid;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public boolean isHasReviewed() { return hasReviewed; }
    public void setHasReviewed(boolean hasReviewed) { this.hasReviewed = hasReviewed; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
}
