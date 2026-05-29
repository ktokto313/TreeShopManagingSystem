package swp391.group6.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ShoppingCartEntry")
public class ShoppingCartEntry {
    @Id
    @ManyToOne
    private Product product;

    @Id
    @ManyToOne
    private ShoppingCart shoppingCart;

    @Column(nullable = false)
    private int quantity;

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public ShoppingCart getShoppingCart() {
        return shoppingCart;
    }

    public void setShoppingCart(ShoppingCart shoppingCart) {
        this.shoppingCart = shoppingCart;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
