package swp391.group6.model;

import jakarta.persistence.*;

import java.util.List;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock = 0;

    @Column(nullable = false)
    private boolean status = true;

    @Column(nullable = false, unique = true)
    private String sku;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private ProductDetail productDetail;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetailList;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ShoppingCartEntry> shoppingCartEntryList;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public ProductDetail getProductDetail() { return productDetail; }
    public void setProductDetail(ProductDetail productDetail) { this.productDetail = productDetail; }

    public List<OrderDetail> getOrderDetailList() { return orderDetailList; }
    public void setOrderDetailList(List<OrderDetail> orderDetailList) { this.orderDetailList = orderDetailList; }

    public List<ShoppingCartEntry> getShoppingCartEntryList() { return shoppingCartEntryList; }
    public void setShoppingCartEntryList(List<ShoppingCartEntry> shoppingCartEntryList) { this.shoppingCartEntryList = shoppingCartEntryList; }
}