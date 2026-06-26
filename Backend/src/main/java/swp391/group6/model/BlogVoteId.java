package swp391.group6.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class BlogVoteId implements Serializable {

    private Long userId;
    private Long postId;

    public BlogVoteId() {}

    public BlogVoteId(Long userId, Long postId) {
        this.userId = userId;
        this.postId = postId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getPostId() {
        return postId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BlogVoteId)) return false;
        BlogVoteId that = (BlogVoteId) o;
        return Objects.equals(userId, that.userId)
                && Objects.equals(postId, that.postId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, postId);
    }
}