package swp391.group6.dto;

import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
@Builder
public class BlogResponse {

    private long id;
    private long authorId;
    private String authorName;
    private String title;
    private String content;
    private String thumbnail;
    private String status;
    private long voteCount;
    private boolean votedByCurrentUser;
    private List<String> images;
    private List<String> tags;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private boolean hasPendingEdit;
    private String pendingTitle;
    private String pendingContent;
    private String pendingThumbnail;
    private List<String> pendingImages;
}