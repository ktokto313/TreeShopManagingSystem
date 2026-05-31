package swp391.group6.model;

import jakarta.persistence.*;

// Fixed: table name was "ShoppingCartEntry" — actual DB table is "shopping_cart_entry"
// Fixed: added @IdClass to support composite PK (cart_id + product_id)
// Fixed: FK column names aligned to DB (cart_id, product_id)
@Entity
@IdClass(ShoppingCartEntryId.class)
@Table(name = "shopping_cart_entry")
public class ShoppingCartEntry {
    @Id
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Id
    @ManyToOne
    @JoinColumn(name = "cart_id")
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
