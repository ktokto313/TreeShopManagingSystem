/*
 * Author: Hung Dao
 * Created Date: 2026-06-26
 * Name: BlogPost.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-15
 */
package swp391.group6.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "blog_posts")
public class BlogPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BlogStatus status = BlogStatus.DRAFT;

    @Column(name = "is_published", insertable = false, updatable = false)
    private boolean isPublished;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "pending_title", length = 300)
    private String pendingTitle;

    @Column(name = "pending_content", columnDefinition = "TEXT")
    private String pendingContent;

    @Column(name = "pending_thumbnail", columnDefinition = "TEXT")
    private String pendingThumbnail;

    @Column(name = "has_pending_edit", nullable = false)
    private boolean hasPendingEdit;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BlogImage> images;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "blog_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false, length = 50)
    private Set<BlogTag> tags = new HashSet<>();

    @PrePersist
    void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }

    public long getId() { return id; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public BlogStatus getStatus() { return status; }
    public void setStatus(BlogStatus status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public Timestamp getUpdatedAt() { return updatedAt; }

    public List<BlogImage> getImages() { return images; }

    public String getPendingTitle() { return pendingTitle; }
    public void setPendingTitle(String pendingTitle) { this.pendingTitle = pendingTitle; }

    public String getPendingContent() { return pendingContent; }
    public void setPendingContent(String pendingContent) { this.pendingContent = pendingContent; }

    public String getPendingThumbnail() { return pendingThumbnail; }
    public void setPendingThumbnail(String pendingThumbnail) { this.pendingThumbnail = pendingThumbnail; }

    public boolean isHasPendingEdit() { return hasPendingEdit; }
    public void setHasPendingEdit(boolean hasPendingEdit) { this.hasPendingEdit = hasPendingEdit; }

    public Set<BlogTag> getTags() { return tags; }
    public void setTags(Set<BlogTag> tags) { this.tags = tags; }
}