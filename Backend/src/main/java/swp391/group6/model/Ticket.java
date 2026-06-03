package swp391.group6.model;

import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String detail;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User ticketCreator;

    @ManyToOne
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private TicketState ticketState;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(name = "ticket_type", nullable = false)
    private String ticketType;

    @Column(name = "time_created", nullable = false)
    private Timestamp timeCreated;

    @Column(name = "time_resolved")
    private Timestamp timeResolved;

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public User getTicketCreator() { return ticketCreator; }
    public void setTicketCreator(User ticketCreator) { this.ticketCreator = ticketCreator; }

    public User getAssignee(){ return assignee;}
    public void setAssignee(User assignee){ this.assignee = assignee;}

    public TicketState getTicketState() { return ticketState; }
    public void setTicketState(TicketState ticketState) { this.ticketState = ticketState; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getTicketType() { return ticketType; }
    public void setTicketType(String ticketType) { this.ticketType = ticketType; }

    public Timestamp getTimeCreated() { return timeCreated; }
    public void setTimeCreated(Timestamp timeCreated) { this.timeCreated = timeCreated; }

    public Timestamp getTimeResolved() { return timeResolved; }
    public void setTimeResolved(Timestamp timeResolved) { this.timeResolved = timeResolved; }
}
