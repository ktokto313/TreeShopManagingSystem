/*
 * Author: PlotChat
 * Created Date: 2026-06-08
 * Name: CommentService.java
 * Description: 
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-15
 */
package swp391.group6.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import swp391.group6.model.Comment;
import swp391.group6.model.Ticket;
import swp391.group6.model.User;
import swp391.group6.repository.CommentRepository;
import swp391.group6.repository.TicketRepository;
import swp391.group6.repository.UserRepository;

import java.sql.Timestamp;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public Comment commentOnTicket(long ticketId, String commentCreatorEmail, String commentDetail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        User commentCreator = userRepository.findByEmail(commentCreatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCreator = ticket.getTicketCreator() != null &&
                ticket.getTicketCreator().getEmail().equals(commentCreatorEmail);

        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getEmail().equals(commentCreatorEmail);

        // Disallow commenting if they are not an agent or ticket creator
        if (!isCreator && !isAssignee) {
            throw new RuntimeException("Unauthorized: You do not have permission to comment on this ticket.");
        }

        Comment newComment = new Comment();
        newComment.setCommentCreator(commentCreator);
        newComment.setTicket(ticket);
        newComment.setDetail(commentDetail);
        newComment.setTimeCreated(new Timestamp(System.currentTimeMillis()));

        commentRepository.save(newComment);

        return newComment;
    }

    public List<Comment> getTicketComments(long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isCreator = ticket.getTicketCreator() != null &&
                ticket.getTicketCreator().getId() == currentUser.getId();

        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getId() == currentUser.getId();

        boolean isAgent = currentUser.getRole().getId() == 4;

        // Allow access if they are the creator, the assignee, OR an agent
        if (!isCreator && !isAssignee && !isAgent) {
            throw new RuntimeException("Unauthorized to view these comments");
        }

        return commentRepository.findByTicketId(ticketId);
    }
}
