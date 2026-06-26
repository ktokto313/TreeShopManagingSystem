package swp391.group6.model;

import jakarta.persistence.*;

@Entity
@Table(name = "blog_images")
public class BlogImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private BlogPost post;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    public void setPost(BlogPost post) { this.post = post; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}