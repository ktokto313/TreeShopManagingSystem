/*
 * Name: User Entity
 * @Author: DucLM
 * Date: 2026-06-02
 * Version: 2.0
 * Description: JPA entity mapping the users table, including role, status, and related domain associations.
 */
package swp391.group6.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

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
    @JoinColumn(name = "role_id")
    private Role role;

    @Column
    private boolean status;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "commentCreator")
    private List<Comment> commentList;

    @JsonIgnore
    @OneToMany(mappedBy = "ticketCreator")
    private List<Ticket> ticketList;

    @JsonIgnore
    @OneToMany(mappedBy = "assignee")
    private List<Ticket> assignedTicketList;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Review> reviewList;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Order> orderList;

    @JsonIgnore
    @OneToOne(mappedBy = "customer")
    private ShoppingCart shoppingCart;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<Comment> getCommentList() { return commentList; }
    public void setCommentList(List<Comment> commentList) { this.commentList = commentList; }

    public List<Ticket> getTicketList() { return ticketList; }
    public void setTicketList(List<Ticket> ticketList) { this.ticketList = ticketList; }

    public List<Ticket> getAssignedTicketList(){ return assignedTicketList; }
    public void setAssignedTicketList(List<Ticket> assignedTicketList){ this.assignedTicketList = assignedTicketList;}

    public List<Review> getReviewList() { return reviewList; }
    public void setReviewList(List<Review> reviewList) { this.reviewList = reviewList; }

    public List<Order> getOrderList() { return orderList; }
    public void setOrderList(List<Order> orderList) { this.orderList = orderList; }

    public ShoppingCart getShoppingCart() { return shoppingCart; }
    public void setShoppingCart(ShoppingCart shoppingCart) { this.shoppingCart = shoppingCart; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null || role.getName() == null) {
            return Collections.emptyList();
        }
        return List.of(() -> "ROLE_" + role.getName());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status;
    }
}