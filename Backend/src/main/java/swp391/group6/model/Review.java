/*
 * Author: ktokto313
 * Created Date: 2026-05-29
 * Name: Review.java
 * Description: 
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-25
 */
package swp391.group6.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumns({
        @JoinColumn(name = "order_id", referencedColumnName = "order_id", nullable = false),
        @JoinColumn(name = "product_id", referencedColumnName = "product_id", nullable = false)
    })
    private OrderDetail orderDetail;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private short rating;

    @Column
    private String comment;

    @Column(nullable = false)
    private Timestamp createdAt;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public void setOrderDetail(OrderDetail orderDetail) {
        this.orderDetail = orderDetail;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public short getRating() {
        return rating;
    }

    public void setRating(short rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
