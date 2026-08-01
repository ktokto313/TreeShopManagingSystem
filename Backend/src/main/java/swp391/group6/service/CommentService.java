/*
 * Author: PlotChat
 * Created Date: 2026-06-08
 * Name: CommentService.java
 * Description: 
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-15
 */
package swp391.group6.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import swp391.group6.model.Comment;
import swp391.group6.model.NotificationType;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;
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
    private final NotificationService notificationService;

    CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Comment commentOnTicket(long ticketId, String commentCreatorEmail, String commentDetail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu hỗ trợ."));

        if (ticket.getTicketState() == TicketState.RESOLVED || ticket.getTicketState() == TicketState.DONE) {
            throw new IllegalArgumentException("Không thể bình luận trên phiếu hỗ trợ đã xử lí hoặc đã xong.");
        }

        User commentCreator = userRepository.findByEmail(commentCreatorEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        boolean isCreator = ticket.getTicketCreator() != null &&
                ticket.getTicketCreator().getEmail().equals(commentCreatorEmail);

        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getEmail().equals(commentCreatorEmail);

        // Disallow commenting if they are not an agent or ticket creator
        if (!isCreator && !isAssignee) {
            throw new AccessDeniedException("Bạn không có quyền bình luận trên phiếu này.");
        }

        if (commentDetail == null || commentDetail.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung bình luận không được để trống!");
        }

        Comment newComment = new Comment();
        newComment.setCommentCreator(commentCreator);
        newComment.setTicket(ticket);
        newComment.setDetail(commentDetail);
        newComment.setTimeCreated(new Timestamp(System.currentTimeMillis()));

        commentRepository.save(newComment);

        if (isCreator && ticket.getAssignee() != null) {
            notificationService.notifyUserByTemplate(
                    ticket.getAssignee().getId(),
                    NotificationType.SUPPORT_TICKET_UPDATE,
                    "TICKET_COMMENT_AGENT",
                    ticket.getTitle()
            );
        } else if (isAssignee && ticket.getTicketCreator() != null) {
            notificationService.notifyUserByTemplate(
                    ticket.getTicketCreator().getId(),
                    NotificationType.SUPPORT_TICKET_UPDATE,
                    "TICKET_COMMENT_CUSTOMER",
                    ticket.getTitle()
            );
        }

        return newComment;
    }

    public List<Comment> getTicketComments(long ticketId, String userEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu hỗ trợ."));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        boolean isCreator = ticket.getTicketCreator() != null &&
                ticket.getTicketCreator().getId() == currentUser.getId();

        boolean isAssignee = ticket.getAssignee() != null &&
                ticket.getAssignee().getId() == currentUser.getId();

        boolean isAgent = currentUser.getRole().getId() == 4;
        boolean isUnassigned = ticket.getAssignee() == null;

        // Allow access if they are the creator, the assignee, OR an agent looking at an unassigned ticket
        if (!isCreator && !isAssignee && !(isAgent && isUnassigned)) {
            throw new AccessDeniedException("Bạn không có quyền xem bình luận của phiếu này.");
        }

        return commentRepository.findByTicketId(ticketId);
    }
}
