package swp391.group6.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "shopping_carts")
public class ShoppingCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private User customer;

    @OneToMany(mappedBy = "shoppingCart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShoppingCartEntry> items;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer =customer; }

    public List<ShoppingCartEntry> getItems() { return items; }
    public void setItems(List<ShoppingCartEntry> items) { this.items = items; }
}
