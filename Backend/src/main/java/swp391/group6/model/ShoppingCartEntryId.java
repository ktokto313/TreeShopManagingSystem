/*
 * Author: Hung Dao
 * Created Date: 2026-05-30
 * Name: ShoppingCartEntryId.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-05-30
 */
package swp391.group6.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ShoppingCartEntryId implements Serializable {
    private Long productId;
    private Long shoppingCartId;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getShoppingCartId() { return shoppingCartId; }
    public void setShoppingCartId(Long shoppingCartId) { this.shoppingCartId = shoppingCartId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShoppingCartEntryId)) return false;
        ShoppingCartEntryId that = (ShoppingCartEntryId) o;
        return Objects.equals(productId, that.productId) &&
                Objects.equals(shoppingCartId, that.shoppingCartId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, shoppingCartId);
    }
}