package swp391.group6.model;

import java.io.Serializable;
import java.util.Objects;

public class OrderDetailId implements Serializable {
    private long order;
    private long product;

    public OrderDetailId() {}

    public OrderDetailId(long order, long product) {
        this.order = order;
        this.product = product;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderDetailId that)) return false;
        return order == that.order && product == that.product;
    }

    @Override
    public int hashCode() {
        return Objects.hash(order, product);
    }
}
