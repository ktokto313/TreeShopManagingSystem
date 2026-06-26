package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import swp391.group6.dto.BlogRequest;
import swp391.group6.dto.BlogResponse;
import swp391.group6.dto.LoginResponse;
import swp391.group6.service.BlogService;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService service;

    @Value("${jwt.cookie.name}")
    private String cookieName;

    // helper

    private LoginResponse getUser(HttpServletRequest request) {
        LoginResponse user =
                (LoginResponse) request.getAttribute(cookieName);

        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return user;
    }

    private void requireAdmin(LoginResponse user) {
        if (!"MANAGER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }
    }

    // VIEW

    @GetMapping
    public List<BlogResponse> getPublished(HttpServletRequest request) {
        LoginResponse user = (LoginResponse) request.getAttribute(cookieName);
        Long userId = (user != null) ? user.getId() : null;

        return service.getPublished(userId);
    }

    @GetMapping("/{id}")
    public BlogResponse getById(@PathVariable long id,
                                HttpServletRequest request) {
        LoginResponse user = (LoginResponse) request.getAttribute(cookieName);
        Long userId = (user != null) ? user.getId() : null;

        return service.getById(id, userId);
    }

    @GetMapping("/pending")
    public List<BlogResponse> getPending(HttpServletRequest request) {
        requireAdmin(getUser(request));
        return service.getPending();
    }

    // CREATE

    @PostMapping
    public BlogResponse create(HttpServletRequest request,
                               @RequestBody BlogRequest req) {

        LoginResponse user = getUser(request);
        return service.create(req, user.getEmail());
    }

    // UPDATE

    @PutMapping("/{id}")
    public BlogResponse update(@PathVariable long id,
                               HttpServletRequest request,
                               @RequestBody BlogRequest req) {

        LoginResponse user = getUser(request);
        return service.update(id, req, user.getEmail());
    }

    // DELETE

    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable long id,
                          HttpServletRequest request) {

        LoginResponse user = getUser(request);
        return service.delete(id, user.getEmail());
    }

    // APPROVE / REJECT
    @PostMapping("/{id}/approve")
    public boolean approve(@PathVariable long id,
                           HttpServletRequest request) {

        requireAdmin(getUser(request));
        return service.approve(id);
    }

    @PostMapping("/{id}/reject")
    public boolean reject(@PathVariable long id,
                          HttpServletRequest request) {

        requireAdmin(getUser(request));
        return service.reject(id);
    }

    // VOTE
    @PostMapping("/{id}/vote")
    public boolean vote(@PathVariable long id,
                        HttpServletRequest request) {

        LoginResponse user = getUser(request);
        return service.toggleVote(id, user.getEmail());
    }
}