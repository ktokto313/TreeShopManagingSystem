package swp391.group6.model;

import jakarta.persistence.*;

import java.sql.Timestamp;

// Fixed: table name was "Comment" — actual DB table is "comments"
// Fixed: removed stale @ManyToOne on primitive long ticketID field (was causing startup failure)
// Fixed: added explicit @JoinColumn names to match DB columns (creator_id, ticket_id, time_created)
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String detail;

    // DB column name is "time_created"
    @Column(name = "time_created")
    private Timestamp timeCreated;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creatorID;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public Timestamp getTimeCreated() {
        return timeCreated;
    }

    public void setTimeCreated(Timestamp timeCreated) {
        this.timeCreated = timeCreated;
    }

    public User getCreatorID() {
        return creatorID;
    }

    public void setCreatorID(User creatorID) {
        this.creatorID = creatorID;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }
}
