package swp391.group6.dto;

import swp391.group6.model.Order;
import swp391.group6.model.OrderStatus;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class OrderDTO {

    private long id;
    private String customerName;
    private String customerPhone;
    private Long shipperId;
    private String shipperName;
    private String shipperPhone;
    private String shippingAddress;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private Timestamp createdAt;
    private OrderStatus status;
    private List<OrderDetailDTO> orderDetailList;

    public OrderDTO() {}

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.customerName = order.getUser() != null ? order.getUser().getFullName() : null;
        this.customerPhone = order.getUser() != null ? order.getUser().getPhone() : null;
        this.shipperId = order.getShipper() != null ? order.getShipper().getId() : null;
        this.shipperName = order.getShipper() != null ? order.getShipper().getFullName() : null;
        this.shipperPhone = order.getShipper() != null ? order.getShipper().getPhone() : null;
        this.shippingAddress = order.getShippingAddress();
        this.shippingFee = order.getShippingFee();
        this.discount = order.getDiscount();
        this.createdAt = order.getCreatedAt();
        this.status = order.getStatus();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() {
        return customerPhone;
    }
    public void setCustomerPhone(String customerPhoneNumber) {
        this.customerPhone = customerPhoneNumber;
    }

    public Long getShipperId() {
        return shipperId;
    }
    public void setShipperId(long shipperId) {
        this.shipperId = shipperId;
    }

    public String getShipperName() { return shipperName; }
    public void setShipperName(String shipperName) { this.shipperName = shipperName; }

    public String getShipperPhone() {
        return shipperPhone;
    }
    public void setShipperPhone(String shipperPhone) {
        this.shipperPhone = shipperPhone;
    }

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

    public List<OrderDetailDTO> getOrderDetailList() { return orderDetailList; }
    public void setOrderDetailList(List<OrderDetailDTO> orderDetailList) { this.orderDetailList = orderDetailList; }
}
