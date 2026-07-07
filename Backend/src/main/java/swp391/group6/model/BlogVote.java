/*
 * Author: Hung Dao
 * Created Date: 2026-06-26
 * Name: BlogVote.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-26
 */
package swp391.group6.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Entity
@Table(name = "blog_votes")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogVote {

    @EmbeddedId
    private BlogVoteId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @MapsId("postId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private BlogPost post;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @PrePersist
    void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }
}