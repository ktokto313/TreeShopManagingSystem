/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogService.java
 * Description:
 * Last Change Author: HungDLM
 * Last Change Date: 2026-07-20
 */
package swp391.group6.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.dto.BlogRequest;
import swp391.group6.dto.BlogResponse;
import swp391.group6.dto.BlogTagOption;
import swp391.group6.model.*;
import swp391.group6.model.NotificationType;
import swp391.group6.repository.*;

import java.util.Arrays;
import java.util.HashSet;
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
    private final NotificationService notificationService; // added for blog notification triggers

    // VIEW BLOG

    public List<BlogResponse> getPublished(Long userId, List<BlogTag> tags) {
        List<BlogPost> posts = (tags == null || tags.isEmpty())
                ? postRepo.findByStatusOrderByCreatedAtDesc(BlogStatus.PUBLISHED)
                : postRepo.findByTagsInAndStatus(tags, BlogStatus.PUBLISHED);

        return posts.stream()
                .map(p -> toResponse(p, userId))
                .toList();
    }

    // Fixed taxonomy — no DB query needed, the enum itself is the source of truth.
    public List<BlogTagOption> getAvailableTags() {
        return Arrays.stream(BlogTag.values())
                .map(t -> new BlogTagOption(t.name(), t.getDisplayName()))
                .toList();
    }

    public BlogResponse getById(long id, Long userId) {
        BlogPost post = postRepo.findById(id).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PUBLISHED) return null;
        return toResponse(post, userId);
    }

    public List<BlogResponse> getPending() {
        return postRepo.findPendingOrHasPendingEdit(BlogStatus.PENDING)
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

        if (req.getTags() != null) {
            post.setTags(new HashSet<>(req.getTags()));
        }

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
        saveImages(post, req.getImages(), false);

        // Notify Managers that a new blog post is waiting for review.
        if (status == BlogStatus.PENDING) {
            notificationService.notifyRoleByTemplate(
                    "MANAGER",
                    NotificationType.BLOG_PENDING_APPROVAL,
                    "BLOG_PENDING_APPROVAL_MANAGER",
                    post.getTitle(), user.getFullName()
            );
        }

        return toResponse(post, user.getId());
    }

    // UPDATE BLOG

    @Transactional
    public BlogResponse update(long postId, BlogRequest req, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        BlogPost post = postRepo.findByIdAndAuthorId(postId, user.getId());
        if (post == null) return null;

        validate(req);

        boolean isManager = "MANAGER".equals(user.getRole().getName());
        boolean isLive = post.getStatus() == BlogStatus.PUBLISHED;

        if (!isManager && isLive) {
            post.setPendingTitle(req.getTitle());
            post.setPendingContent(req.getContent());
            post.setPendingThumbnail(req.getThumbnail());
            post.setHasPendingEdit(true);

            if (req.getTags() != null) {
                post.setTags(new HashSet<>(req.getTags()));
            }

            imageRepo.deleteAll(imageRepo.findByPostIdAndPendingTrue(postId));
            saveImages(post, req.getImages(), true);

            // Edit to a live post needs approval too — notify Managers.
            notificationService.notifyRoleByTemplate(
                    "MANAGER",
                    NotificationType.BLOG_PENDING_APPROVAL,
                    "BLOG_EDIT_PENDING_APPROVAL_MANAGER",
                    post.getTitle(), user.getFullName()
            );

            return toResponse(post, user.getId());
        }

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setThumbnail(req.getThumbnail());

        if (req.getTags() != null) {
            post.setTags(new HashSet<>(req.getTags()));
        }

        boolean movedToPending = false;

        if (!isManager) {
            if (post.getStatus() == BlogStatus.DRAFT && !"DRAFT".equals(req.getStatus())) {
                post.setStatus(BlogStatus.PENDING);
                movedToPending = true;
            }
            if (post.getStatus() == BlogStatus.REJECTED && !"DRAFT".equals(req.getStatus())) {
                post.setStatus(BlogStatus.PENDING);
                movedToPending = true;
            }
        }

        imageRepo.deleteAll(imageRepo.findByPostIdOrderByIdAsc(postId));
        saveImages(post, req.getImages(), false);

        if (movedToPending) {
            notificationService.notifyRoleByTemplate(
                    "MANAGER",
                    NotificationType.BLOG_PENDING_APPROVAL,
                    "BLOG_PENDING_APPROVAL_MANAGER",
                    post.getTitle(), user.getFullName()
            );
        }

        return toResponse(post, user.getId());
    }

    // DELETE BLOG

    @Transactional
    public boolean delete(long postId, String email) {

        User user = userRepo.findByEmail(email).orElseThrow();

        if (!"MANAGER".equals(user.getRole().getName())) return false;

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null || post.getStatus() != BlogStatus.PUBLISHED) return false;

        notifyAuthor(post,
                NotificationType.BLOG_STATUS_UPDATE,
                "BLOG_DELETED_CUSTOMER",
                post.getTitle()
        );

        postRepo.delete(post);
        return true;
    }

    // APPROVE BLOG

    @Transactional
    public boolean approve(long postId) {

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null) return false;

        if (post.getStatus() == BlogStatus.PENDING) {
            post.setStatus(BlogStatus.PUBLISHED);
            postRepo.save(post);
            notifyAuthor(post, NotificationType.BLOG_STATUS_UPDATE,
                    "BLOG_APPROVED_CUSTOMER", post.getTitle());
            return true;
        }

        if (post.getStatus() == BlogStatus.PUBLISHED && post.isHasPendingEdit()) {
            post.setTitle(post.getPendingTitle());
            post.setContent(post.getPendingContent());
            post.setThumbnail(post.getPendingThumbnail());

            post.setHasPendingEdit(false);
            post.setPendingTitle(null);
            post.setPendingContent(null);
            post.setPendingThumbnail(null);

            imageRepo.deleteAll(imageRepo.findByPostIdAndPendingFalse(postId));
            imageRepo.markPendingAsLive(postId);

            postRepo.save(post);
            notifyAuthor(post, NotificationType.BLOG_STATUS_UPDATE,
                    "BLOG_EDIT_APPROVED_CUSTOMER", post.getTitle());
            return true;
        }

        return false;
    }

    @Transactional
    public boolean reject(long postId) {

        BlogPost post = postRepo.findById(postId).orElse(null);
        if (post == null) return false;

        if (post.getStatus() == BlogStatus.PENDING) {
            post.setStatus(BlogStatus.REJECTED);
            postRepo.save(post);
            notifyAuthor(post, NotificationType.BLOG_STATUS_UPDATE,
                    "BLOG_REJECTED_CUSTOMER", post.getTitle());
            return true;
        }

        if (post.getStatus() == BlogStatus.PUBLISHED && post.isHasPendingEdit()) {
            post.setHasPendingEdit(false);
            post.setPendingTitle(null);
            post.setPendingContent(null);
            post.setPendingThumbnail(null);

            imageRepo.deleteAll(imageRepo.findByPostIdAndPendingTrue(postId));

            postRepo.save(post);
            notifyAuthor(post, NotificationType.BLOG_STATUS_UPDATE,
                    "BLOG_EDIT_REJECTED_CUSTOMER", post.getTitle());
            return true;
        }

        return false;
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

    private void saveImages(BlogPost post, List<String> imgs, boolean isPending) {
        if (imgs == null) return;

        imgs.forEach(url -> {
            BlogImage img = new BlogImage();
            img.setPost(post);
            img.setImageUrl(url);
            img.setPending(isPending);
            imageRepo.save(img);
        });
    }

    // Notify the post's author when their blogs status got published/rejected
    private void notifyAuthor(BlogPost post, NotificationType type, String templateKey, Object... args) {
        User author = post.getAuthor();
        notificationService.notifyUserByTemplate(author.getId(), type, templateKey, args);
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
                        imageRepo.findByPostIdAndPendingFalse(post.getId())
                                .stream()
                                .map(BlogImage::getImageUrl)
                                .toList()
                )
                .tags(
                        post.getTags().stream()
                                .map(Enum::name)
                                .sorted()
                                .toList()
                )
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .hasPendingEdit(post.isHasPendingEdit())
                .pendingTitle(post.getPendingTitle())
                .pendingContent(post.getPendingContent())
                .pendingThumbnail(post.getPendingThumbnail())
                .pendingImages(
                        post.isHasPendingEdit()
                                ? imageRepo.findByPostIdAndPendingTrue(post.getId())
                                .stream()
                                .map(BlogImage::getImageUrl)
                                .toList()
                                : List.of()
                )
                .build();
    }

    // OWN BLOGS
    public List<BlogResponse> getMyPosts(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return postRepo.findByAuthorIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(p -> toResponse(p, user.getId()))
                .toList();
    }
}