/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-23
 * Last Modified: 2026-07-03
 */
/*
 * Author: minhlthe200133
 * Created Date: 2026-06-23
 * Name: WishlistItemId.java
 * Description: 
 * Last Change Author: minhlthe200133
 * Last Change Date: 2026-06-23
 */
package swp391.group6.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class WishlistItemId implements Serializable {
    private Long customerId;
    private Long productId;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof WishlistItemId that)) {
            return false;
        }
        return Objects.equals(customerId, that.customerId)
                && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId, productId);
    }
}
