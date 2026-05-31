package swp391.group6.model;

import jakarta.persistence.*;

// Fixed: table name was "ShoppingCarts" — actual DB table is "shopping_carts"
// Fixed: removed @OneToMany misplaced on @Id field (was causing startup failure)
// DB has customer_id FK on this table, so ShoppingCart owns the User relationship
@Entity
@Table(name = "shopping_carts")
public class ShoppingCart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private User customer;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }
}
