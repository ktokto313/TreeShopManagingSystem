package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Comment;
import swp391.group6.service.CommentService;
import swp391.group6.util.JWTUtil;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {
    private final CommentService commentService;

    CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Create comment
    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable long ticketId,
            @RequestBody String detail,
            HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);

        try {
            Comment newComment = commentService.commentOnTicket(ticketId, currentUser.getEmail(), detail);
            return ResponseEntity.status(HttpStatus.CREATED).body(newComment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByTicketId(
            @PathVariable long ticketId,
            HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);

        try {
            List<Comment> comments = commentService.getTicketComments(ticketId, currentUser.getEmail());
            return ResponseEntity.ok(comments);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
