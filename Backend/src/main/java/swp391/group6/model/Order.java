package swp391.group6.model;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

// Fixed: table name was "Orders" — actual DB table is "orders"
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    // DB column is customer_id; @ManyToOne maps via the FK automatically
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User user;

    // DB has shipper_id as a nullable FK to users
    @ManyToOne
    @JoinColumn(name = "shipper_id")
    private User shipper;

    @Column
    private String shippingAddress;

    @Column(nullable = false)
    private Double shippingFee;

    @Column(nullable = false)
    private Double discount;

    @Column(nullable = false)
    private Timestamp createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // Fixed: mappedBy matches OrderDetail field name "order"
    @OneToMany(mappedBy = "order")
    private List<OrderDetail> orderDetailList;

    // Fixed: mappedBy matches Review field name "order"
    @OneToMany(mappedBy = "order")
    private List<Review> reviewList;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getShipper() {
        return shipper;
    }

    public void setShipper(User shipper) {
        this.shipper = shipper;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Double getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(Double shippingFee) {
        this.shippingFee = shippingFee;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public List<OrderDetail> getOrderDetailList() {
        return orderDetailList;
    }

    public void setOrderDetailList(List<OrderDetail> orderDetailList) {
        this.orderDetailList = orderDetailList;
    }

    public List<Review> getReviewList() {
        return reviewList;
    }

    public void setReviewList(List<Review> reviewList) {
        this.reviewList = reviewList;
    }
}
