/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-23
 * Last Modified: 2026-07-03
 */
/*
 * Author: minhlthe200133
 * Created Date: 2026-06-23
 * Name: WishlistItem.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-23
 */
package swp391.group6.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "wishlist_items")
public class WishlistItem {

    @EmbeddedId
    private WishlistItemId id;

    @ManyToOne
    @MapsId("customerId")
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    public WishlistItemId getId() {
        return id;
    }

    public void setId(WishlistItemId id) {
        this.id = id;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
