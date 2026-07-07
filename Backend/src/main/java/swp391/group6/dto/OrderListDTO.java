package swp391.group6.dto;

import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class OrderListDTO {

    private long id;
    private String shippingAddress;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private Timestamp createdAt;
    private OrderStatus status;
    private List<OrderDetailDTO> orderDetailList;

    public OrderListDTO() {}

    public OrderListDTO(Order order) {
        this.id = order.getId();
        this.shippingAddress = order.getShippingAddress();
        this.shippingFee = order.getShippingFee();
        this.discount = order.getDiscount();
        this.createdAt = order.getCreatedAt();
        this.status = order.getStatus();
        this.orderDetailList = order.getOrderDetailList().stream().map(orderDetail -> new OrderDetailDTO(orderDetail, false)).toList();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public List<OrderDetailDTO> getOrderDetailList() {
        return orderDetailList;
    }

    public void setOrderDetailList(List<OrderDetailDTO> orderDetailList) {
        this.orderDetailList = orderDetailList;
    }
}
