/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogImage.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-27
 */
package swp391.group6.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_images")
@Getter
@Setter
public class BlogImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private BlogPost post;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(columnDefinition = "BYTEA")
    private byte[] imageData;

    private String fileName;
    private String contentType;
}