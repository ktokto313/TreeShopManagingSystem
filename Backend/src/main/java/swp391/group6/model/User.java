package swp391.group6.model;

import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column
    private String email;

    @Column
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column
    private String phone;

    @ManyToOne
    private Role role;

    @Column
    private boolean status;

    @Column
    private Timestamp createdAt;

    @OneToMany(mappedBy = "creatorID")
    private List<Comment> commentList;

    @OneToMany(mappedBy = "creatorId")
    private List<Ticket> createdTicketList;

    @OneToMany(mappedBy = "assigneeId")
    private List<Ticket> assignedTicketList;

    @OneToMany(mappedBy = "customerId")
    private List<Review> reviewList;

    @OneToMany(mappedBy = "customer_id")
    private List<Order> orderList;

    @OneToOne(mappedBy = "customerId")
    private ShoppingCart shoppingCart;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public List<Comment> getCommentList() {
        return commentList;
    }

    public void setCommentList(List<Comment> commentList) {
        this.commentList = commentList;
    }

    public List<Ticket> getCreatedTicketList() {
        return createdTicketList;
    }

    public void setCreatedTicketList(List<Ticket> createdTicketList) {
        this.createdTicketList = createdTicketList;
    }

    public List<Ticket> getAssignedTicketList() {
        return assignedTicketList;
    }

    public void setAssignedTicketList(List<Ticket> assignedTicketList) {
        this.assignedTicketList = assignedTicketList;
    }

    public List<Review> getReviewList() {
        return reviewList;
    }

    public void setReviewList(List<Review> reviewList) {
        this.reviewList = reviewList;
    }

    public List<Order> getOrderList() {
        return orderList;
    }

    public void setOrderList(List<Order> orderList) {
        this.orderList = orderList;
    }

    public ShoppingCart getShoppingCart() {
        return shoppingCart;
    }

    public void setShoppingCart(ShoppingCart shoppingCart) {
        this.shoppingCart = shoppingCart;
    }
}
