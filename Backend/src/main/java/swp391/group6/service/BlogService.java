package swp391.group6.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.BlogRequest;
import swp391.group6.dto.BlogResponse;
import swp391.group6.model.*;
import swp391.group6.repository.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BlogService {

    private static final int MAX_IMAGES = 4;
    private static final int MAX_TITLE_WORDS = 100;

    private final BlogPostRepository postRepo;
    private final BlogVoteRepository voteRepo;
    private final BlogImageRepository imageRepo;
    private final UserRepository userRepo;

    // VIEW BLOG

    public List<BlogResponse> getPublished(Long userId) {
        return postRepo.findByStatusOrderByCreatedAtDesc(BlogStatus.PUBLISHED)
                .stream()
                .map(p -> toResponse(p, userId))
                .toList();
    }

    public BlogResponse getById(long id, Long userId) {
        BlogPost post = postRepo.findById(id).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PUBLISHED) return null;
        return toResponse(post, userId);
    }

    public List<BlogResponse> getPending() {
        return postRepo.findByStatusOrderByCreatedAtDesc(BlogStatus.PENDING)
                .stream()
                .map(p -> toResponse(p, null))
                .toList();
    }

    // CREATE BLOG

    @Transactional
    public BlogResponse create(BlogRequest req, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();
        validate(req);

        boolean isManager = "MANAGER".equals(user.getRole().getName());

        BlogPost post = new BlogPost();
        post.setAuthor(user);
        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setThumbnail(req.getThumbnail());

        BlogStatus status;

        try {
            BlogStatus requested = BlogStatus.valueOf(req.getStatus());

            if (isManager) {
                status = (requested == BlogStatus.DRAFT || requested == BlogStatus.PUBLISHED)
                        ? requested : BlogStatus.DRAFT;
            } else {
                status = (requested == BlogStatus.DRAFT)
                        ? BlogStatus.DRAFT
                        : BlogStatus.PENDING;
            }

        } catch (Exception e) {
            status = isManager ? BlogStatus.PUBLISHED : BlogStatus.PENDING;
        }

        post.setStatus(status);

        postRepo.save(post);
        saveImages(post, req.getImages());

        return toResponse(post, user.getId());
    }

    // UPDATE BLOG

    @Transactional
    public BlogResponse update(long postId, BlogRequest req, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        BlogPost post = postRepo.findByIdAndAuthorId(postId, user.getId());
        if (post == null) return null;

        validate(req);

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setThumbnail(req.getThumbnail());

        boolean isManager = "MANAGER".equals(user.getRole().getName());

        if (!isManager) {
            if (post.getStatus() == BlogStatus.PUBLISHED) {
                post.setStatus(BlogStatus.PENDING);
            }
            if (post.getStatus() == BlogStatus.DRAFT && !"DRAFT".equals(req.getStatus())) {
                post.setStatus(BlogStatus.PENDING);
            }
        }
        imageRepo.deleteAll(imageRepo.findByPostIdOrderByIdAsc(postId));
        saveImages(post, req.getImages());

        return toResponse(post, user.getId());
    }

    // DELETE BLOG

    @Transactional
    public boolean delete(long postId, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        if (!"MANAGER".equals(user.getRole().getName())) return false;

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PUBLISHED) return false;

        postRepo.delete(post);
        return true;
    }

    // APPROVE BLOG

    @Transactional
    public boolean approve(long postId) {

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PENDING) return false;

        post.setStatus(BlogStatus.PUBLISHED);
        postRepo.save(post);

        return true;
    }

    @Transactional
    public boolean reject(long postId) {

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PENDING) return false;

        post.setStatus(BlogStatus.REJECTED);
        postRepo.save(post);

        return true;
    }

    // UPVOTE BLOG

    @Transactional
    public boolean toggleVote(long postId, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        if (!"CUSTOMER".equals(user.getRole().getName())) return false;

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PUBLISHED) return false;

        Long userId = user.getId();

        if (voteRepo.existsByUserIdAndPostId(userId, postId)) {
            voteRepo.deleteByUserIdAndPostId(userId, postId);
        } else {
            BlogVote vote = BlogVote.builder()
                    .id(new BlogVoteId(userId, postId))
                    .user(user)
                    .post(post)
                    .build();
            voteRepo.save(vote);
        }

        return true;
    }

    // VALIDATION

    private void validate(BlogRequest req) {

        if (req.getTitle() == null || req.getTitle().isBlank())
            throw new IllegalArgumentException("Title required");

        if (req.getContent() == null || req.getContent().isBlank())
            throw new IllegalArgumentException("Content required");

        if (req.getThumbnail() == null || req.getThumbnail().isBlank())
            throw new IllegalArgumentException("Thumbnail required");

        if (req.getTitle().trim().split("\\s+").length > MAX_TITLE_WORDS)
            throw new IllegalArgumentException("Title exceeds 100 words");

        if (req.getImages() != null && req.getImages().size() > MAX_IMAGES)
            throw new IllegalArgumentException("Too many images");
    }

    // HELPERS

    private void saveImages(BlogPost post, List<String> imgs) {
        if (imgs == null) return;

        imgs.forEach(url -> {
            BlogImage img = new BlogImage();
            img.setPost(post);
            img.setImageUrl(url);
            imageRepo.save(img);
        });
    }

    private BlogResponse toResponse(BlogPost post, Long userId) {

        return BlogResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getFullName())
                .title(post.getTitle())
                .content(post.getContent())
                .thumbnail(post.getThumbnail())
                .status(post.getStatus().name())
                .voteCount(voteRepo.countByPostId(post.getId()))
                .votedByCurrentUser(
                        userId != null &&
                                voteRepo.existsByUserIdAndPostId(userId, post.getId())
                )
                .images(
                        imageRepo.findByPostIdOrderByIdAsc(post.getId())
                                .stream()
                                .map(BlogImage::getImageUrl)
                                .toList()
                )
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}