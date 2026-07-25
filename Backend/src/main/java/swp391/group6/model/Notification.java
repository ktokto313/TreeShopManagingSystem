/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: Notification.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
 */
package swp391.group6.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // set when notification targets one specific user (e.g. Customer's own order)
    @Column(name = "recipient_user_id")
    private Long recipientUserId;

    // set when notification broadcasts to a role instead (e.g. any Manager)
    @ManyToOne
    @JoinColumn(name = "recipient_role_id")
    private Role recipientRole;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_via_email", nullable = false)
    private boolean sentViaEmail;

    @Column(name = "email_send_failed", nullable = false)
    private boolean emailSendFailed;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


    public Long getId() { return id; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public Role getRecipientRole() { return recipientRole; }
    public void setRecipientRole(Role recipientRole) { this.recipientRole = recipientRole; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}