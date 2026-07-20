/*
 * Author: Hung Dao
 * Created Date: 2026-06-26
 * Name: BlogController.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-20
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import swp391.group6.dto.BlogRequest;
import swp391.group6.dto.BlogResponse;
import swp391.group6.dto.BlogTagOption;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.BlogImage;
import swp391.group6.model.BlogTag;
import swp391.group6.repository.BlogImageRepository;
import swp391.group6.service.BlogService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService service;
    private final BlogImageRepository imageRepo;

    @Value("${jwt.cookie.name}")
    private String cookieName;

    // helper
    private LoginResponse getUser(HttpServletRequest request) {
        LoginResponse user = (LoginResponse) request.getAttribute(cookieName);
        if (user == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return user;
    }

    // BR-32/BR-33/BR-38/BR-42: gate used to restrict Manager-only actions
    // (approve/reject, delete, viewing pending queue).
    private void requireManager(LoginResponse user) {
        if (!"MANAGER".equals(user.getRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }

    // VIEW

    // BR-26: Only blog posts with status "Published" are visible to any user.
    // BR-74/BR-75/BR-76: accepts one or multiple tags and returns results filtered
    // dynamically by all selected tags (actual match-all-tags logic lives in
    // service.getPublished — confirm there).
    // BR-27: vote count on returned BlogResponse must be visible regardless of
    // whether userId is null (i.e., unauthenticated) — verify in service/DTO mapping.
    @GetMapping
    public List<BlogResponse> getPublished(@RequestParam(required = false) List<BlogTag> tags,
                                           HttpServletRequest request) {
        LoginResponse user = (LoginResponse) request.getAttribute(cookieName);
        Long userId = (user != null) ? user.getId() : null;
        return service.getPublished(userId, tags);
    }

    // TAGS

    // Supports BR-74: supplies the set of tags a user can select for filtering.
    @GetMapping("/tags")
    public List<BlogTagOption> getAvailableTags() {
        return service.getAvailableTags();
    }

    // BR-26: presumably only reachable/visible for "Published" posts to anonymous/customer
    // callers — enforcement of that restriction should be checked inside service.getById.
    // BR-50: passes userId (nullable) through so the response can reflect the current
    // Customer's vote status when authenticated (BR-27 for vote count regardless).
    @GetMapping("/{id}")
    public BlogResponse getById(@PathVariable long id, HttpServletRequest request) {
        LoginResponse user = (LoginResponse) request.getAttribute(cookieName);
        Long userId = (user != null) ? user.getId() : null;
        return service.getById(id, userId);
    }

    // BR-43: Only blog posts with status "Pending" are available for Manager review —
    @GetMapping("/pending")
    public List<BlogResponse> getPending(HttpServletRequest request) {
        requireManager(getUser(request));
        return service.getPending();
    }

    // CREATE

    // BR-28: thumbnail mandatory. BR-29: title limited to 100 words.
    // BR-30: max 4 gallery image URLs.
    // BR-32: Customer posts always require Manager approval.
    // BR-33: Manager posts bypass approval and publish immediately.
    @PostMapping
    public BlogResponse create(HttpServletRequest request,
                               @RequestBody BlogRequest req) {
        LoginResponse user = getUser(request);
        return service.create(req, user.getEmail());
    }

    // UPDATE

    // BR-34: Users can only edit their own blog posts regardless of role
    // BR-35: a Customer's "Published" post loses published status until re-approved.
    // BR-36: a Manager's post retains its current status after update.
    // BR-37: updating a "Draft" post resets the 12-hour auto-deletion timer.
    // BR-45: editing/resubmitting a "Rejected" post returns it to "Pending".
    @PutMapping("/{id}")
    public BlogResponse update(@PathVariable long id,
                               HttpServletRequest request,
                               @RequestBody BlogRequest req) {
        LoginResponse user = getUser(request);
        return service.update(id, req, user.getEmail());
    }

    // DELETE

    // BR-38: Only Managers can delete blog posts.
    // BR-39: only "Published" posts can be deleted.
    // BR-40: deletion is permanent.
    // BR-41: associated data are removed alongside the post.
    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable long id, HttpServletRequest request) {
        LoginResponse user = getUser(request);
        return service.delete(id, user.getEmail());
    }

    // APPROVE / REJECT

    // BR-42: Any Manager can approve any pending post regardless of author.
    // BR-44: approval requires no additional justification
    @PostMapping("/{id}/approve")
    public boolean approve(@PathVariable long id, HttpServletRequest request) {
        requireManager(getUser(request));
        return service.approve(id);
    }

    // BR-42: Any Manager can reject any pending post regardless of author.
    // BR-44: rejection requires no additional justification.
    // BR-45: rejected post returns to the author, who may edit and resubmit to "Pending".
    @PostMapping("/{id}/reject")
    public boolean reject(@PathVariable long id, HttpServletRequest request) {
        requireManager(getUser(request));
        return service.reject(id);
    }

    // VOTE

    // BR-46: only authenticated Customers can upvote
    // BR-47: one vote per Customer per post. BR-48: toggle behavior — voting again removes the vote
    // BR-49: only published posts can be voted on. (All enforced in service.toggleVote.)
    @PostMapping("/{id}/vote")
    public boolean vote(@PathVariable long id, HttpServletRequest request) {
        LoginResponse user = getUser(request);
        return service.toggleVote(id, user.getEmail());
    }

    // UPLOAD IMAGE

    // Supports BR-30: Gallery images are referenced by external URL, maximum 4 images per post
    @PostMapping("/images/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) throws IOException {

        getUser(request);

        if (file.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File trống");

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận file ảnh");

        BlogImage img = new BlogImage();
        img.setImageData(file.getBytes());
        img.setFileName(file.getOriginalFilename());
        img.setContentType(contentType);
        img.setImageUrl("");

        BlogImage saved = imageRepo.save(img);
        String url = "/api/blogs/images/" + saved.getId();
        saved.setImageUrl(url);
        imageRepo.save(saved);

        return ResponseEntity.ok(Map.of("url", url));
    }

    //IMAGE
    @GetMapping("/images/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable long id) {
        return imageRepo.findById(id)
                .filter(img -> img.getImageData() != null)
                .map(img -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(img.getContentType()))
                        .body(img.getImageData()))
                .orElse(ResponseEntity.notFound().build());
    }

    //OWN BLOG
    @GetMapping("/my")
    public List<BlogResponse> getMyPosts(HttpServletRequest request) {
        LoginResponse user = getUser(request);
        return service.getMyPosts(user.getEmail());
    }
}