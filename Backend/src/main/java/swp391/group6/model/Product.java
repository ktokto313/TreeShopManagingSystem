package swp391.group6.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private long categoryId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private int stock = 0;

    @Column(nullable = false)
    private boolean status = true;

    @Column(unique = true, nullable = true)
    private String sku;

    @OneToOne
    @JoinColumn(name = "productId")
    private List<ProductDetail> productDetailList;

    @ManyToOne
    private List<Category> categoryList;

    @OneToMany(mappedBy = "productId")
    private List<OrderDetail> orderDetailList;

    @OneToMany(mappedBy = "productId")
    private List<ShoppingCartEntry> shoppingCartEntryList;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public List<Category> getCategoryList() {
        return categoryList;
    }

    public void setCategoryList(List<Category> categoryList) {
        this.categoryList = categoryList;
    }

    public List<ProductDetail> getProductDetailList() {
        return productDetailList;
    }

    public void setProductDetailList(List<ProductDetail> productDetailList) {
        this.productDetailList = productDetailList;
    }

    public List<OrderDetail> getOrderDetailList() {
        return orderDetailList;
    }

    public void setOrderDetailList(List<OrderDetail> orderDetailList) {
        this.orderDetailList = orderDetailList;
    }

    public List<ShoppingCartEntry> getShoppingCartEntryList() {
        return shoppingCartEntryList;
    }

    public void setShoppingCartEntryList(List<ShoppingCartEntry> shoppingCartEntryList) {
        this.shoppingCartEntryList = shoppingCartEntryList;
    }
}
