package swp391.group6.model;

import java.io.Serializable;
import java.util.Objects;

public class ShoppingCartEntryId implements Serializable {
    private long product;
    private long shoppingCart;

    public ShoppingCartEntryId() {}

    public ShoppingCartEntryId(long product, long shoppingCart) {
        this.product = product;
        this.shoppingCart = shoppingCart;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShoppingCartEntryId that)) return false;
        return product == that.product && shoppingCart == that.shoppingCart;
    }

    @Override
    public int hashCode() {
        return Objects.hash(product, shoppingCart);
    }
}
