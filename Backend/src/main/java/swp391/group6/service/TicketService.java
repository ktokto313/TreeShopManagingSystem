
/*
 * Author: AnhLV
 * Created Date: 2026-06-05
 * Name: TicketService.java
 * Description: Service layer component handling business logic for tickets.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-03
 */

package swp391.group6.service;

import java.sql.Timestamp;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import jakarta.transaction.Transactional;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.TicketRequest;
import swp391.group6.model.Priority;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;
import swp391.group6.model.NotificationType;
import swp391.group6.model.User;
import swp391.group6.repository.TicketRepository;
import swp391.group6.repository.UserRepository;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService; 

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Optional<Ticket> getTicketById(long id, LoginResponse currentUser) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(id);
        
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            if ("CUSTOMER".equalsIgnoreCase(currentUser.getRole())) {
                if (ticket.getTicketCreator() == null
                        || !ticket.getTicketCreator().getEmail().equals(currentUser.getEmail())) {
                    throw new AccessDeniedException("Bạn không có quyền truy cập phiếu hỗ trợ này.");
                }
            } else if ("SUPPORT_AGENT".equalsIgnoreCase(currentUser.getRole())) {
                if (ticket.getAssignee() != null && !ticket.getAssignee().getEmail().equals(currentUser.getEmail())) {
                    throw new AccessDeniedException("Bạn không có quyền truy cập phiếu hỗ trợ này.");
                }
            } else {
                throw new AccessDeniedException("Bạn không có quyền truy cập phiếu hỗ trợ này.");
            }
        }
        
        return ticketOpt;
    }

    // UC 15: Customer creates a ticket
    public Ticket createTicket(TicketRequest request, String userEmail) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Tiêu đề không được để trống!");
        }

        if (request.getDetail() == null || request.getDetail().isBlank() || request.getDetail().length() < 20) {
            throw new IllegalArgumentException("Chi tiết phải có ít nhất 20 ký tự!");
        }

        if (request.getPriority() == null || request.getPriority().isBlank()) {
            throw new IllegalArgumentException("Phải chọn mức ưu tiên!");
        }

        Priority priority;
        try {
            priority = Priority.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Mức ưu tiên không hợp lệ!");
        }

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        if (!creator.getRole().getName().equalsIgnoreCase("customer")) {
            throw new AccessDeniedException("Bạn không có quyền tạo phiếu hỗ trợ.");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDetail(request.getDetail());
        ticket.setPriority(priority);

        // Default values for a brand new ticket
        ticket.setTicketCreator(creator);
        ticket.setTicketState(TicketState.CREATED);
        ticket.setTimeCreated(new Timestamp(System.currentTimeMillis()));

        ticketRepository.save(ticket);

        // Notify Support Agents that a new ticket needs attention.
        notificationService.notifyRoleByTemplate(
                "SUPPORT_AGENT",
                NotificationType.NEW_SUPPORT_REQUEST,
                "NEW_SUPPORT_REQUEST_AGENT",
                ticket.getTitle(), creator.getFullName()
        );

        // Notify the customer that their ticket was created successfully.
        notificationService.notifyUserByTemplate(
                creator.getId(),
                NotificationType.SUPPORT_TICKET_CREATED,
                "TICKET_CREATED_CUSTOMER",
                ticket.getTitle()
        );

        return ticket;
    }

    // UC 11: View Support Tickets Queue
    public Page<Ticket> getAuthorizedTicketsByEmail(String email, String search, String statusStr, String priorityStr, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email: " + email));

        String searchKeyword = (search != null && !search.isBlank()) ? search.trim() : null;

        // Safely convert strings to Enums, leaving them as null if the frontend didn't send them
        TicketState state = (statusStr != null && !statusStr.isBlank())
                ? TicketState.valueOf(statusStr.toUpperCase()) : null;

        Priority priority = (priorityStr != null && !priorityStr.isBlank())
                ? Priority.valueOf(priorityStr.toUpperCase()) : null;

        // Pass everything to the repository
        Page<Ticket> ticketsResult = null;
        String roleName = (user.getRole() != null && user.getRole().getName() != null) ? user.getRole().getName() : "";

        if ("CUSTOMER".equalsIgnoreCase(roleName)) {
            ticketsResult = ticketRepository.findTicketsByCreatorWithFilters(user.getId(), searchKeyword, state, priority, pageable);
        } else if ("SUPPORT_AGENT".equalsIgnoreCase(roleName)){
            ticketsResult = ticketRepository.findAllWithFiltersAndIsAssigned(user.getId(), searchKeyword, state, priority, pageable);
        } else {
            // Block other roles (like Manager, Shipper) from accessing tickets via this endpoint
            throw new AccessDeniedException("Không có quyền truy cập danh sách phiếu hỗ trợ.");
        }

        return ticketsResult;
    }

    private static TicketState getTicketState(String newStateStr, Ticket ticket, TicketState newState) {
        TicketState originalState = ticket.getTicketState();

        if (newState == originalState) {
            throw new IllegalArgumentException("Phiếu hỗ trợ đã ở trạng thái: " + newStateStr);
        }
        if (newState == TicketState.CREATED) {
            throw new IllegalArgumentException("Phiếu hỗ trợ không thể trở lại trạng thái đã khởi tạo.");
        }
        if (originalState == TicketState.DONE) {
            throw new IllegalArgumentException("Phiếu hỗ trợ đã hoàn thành, không thể chỉnh sửa.");
        }
        return originalState;
    }

    // UC 13 & 14: Update ticket status and resolve ticket (Agent sets to Progress, Customer sets to Resolved)
    public Ticket updateTicketStatus(long ticketId, String newStateStr, LoginResponse currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu hỗ trợ."));

        TicketState newState = TicketState.valueOf(newStateStr.toUpperCase());
        TicketState originalState = getTicketState(newStateStr, ticket, newState);

        String userEmail = currentUser.getEmail();

        boolean isAgent = currentUser.getRole().equals("SUPPORT_AGENT");
        boolean isCustomer = currentUser.getRole().equals("CUSTOMER");

        boolean isCreator = ticket.getTicketCreator().getEmail().equals(userEmail);
        boolean notAssigned = ticket.getAssignee() == null && userEmail != null;

        // FOR AGENTS
        if (isAgent) {
            // Concurrency validation: Check ownership FIRST before state checks
            if (notAssigned) {
                User agent = userRepository.findByEmail(userEmail).orElse(null);
                ticket.setAssignee(agent);
            } else if (!ticket.getAssignee().getEmail().equals(userEmail)) {
                throw new AccessDeniedException("Không thể chỉnh sửa phiếu hỗ trợ đã được phân công cho Agent khác.");
            }

            // State checks for quick fails
            if (originalState == TicketState.CREATED && newState != TicketState.PROCESSING) {
                // Can only go from "CREATED" to "PROCESSING"
                throw new IllegalArgumentException("Agent chỉ có thể chuyển từ trạng thái khởi tạo sang đang xử lý.");
            }
            if (originalState == TicketState.PROCESSING && (newState != TicketState.RESOLVED && newState != TicketState.DONE)) {
                // Can only go from "PROCESSING" to "RESOLVED" OR "DONE"
                throw new IllegalArgumentException("Agent chỉ có thể chuyển đổi sang trạng thái đã xử lí hoặc đã xong.");
            }
            if (originalState == TicketState.RESOLVED) {
                // Agents cannot change anything when its in "RESOLVED"
                throw new IllegalArgumentException("Agent không thể sửa đổi phiếu hỗ trợ đang chờ khách hàng xác nhận.");
            }
        }

        // FOR CUSTOMERS
        else if (isCustomer) {
            if (!isCreator) {
                throw new AccessDeniedException("Chỉ có người tạo phiếu hỗ trợ được quyền thực hiện.");
            }

            // State checks for quick fails
            if (originalState != TicketState.RESOLVED) {
                // Can only change state when the ticket is in "RESOLVED"
                throw new IllegalArgumentException("Khách hàng chỉ có thể cập nhật trạng thái khi phiếu hỗ trợ ở trạng thái đã xử lí.");
            }
            if (newState != TicketState.DONE && newState != TicketState.PROCESSING) {
                // Can only go from "RESOLVED" to "DONE" OR "PROCESSING"
                throw new IllegalArgumentException("Khách hàng chỉ có quyền xác nhận Đồng ý (Xong) hoặc Từ chối (Đang xử lý) giải quyết.");
            }
        }

        // FOR ANY OTHER ROLES
        else {
            throw new AccessDeniedException("Không có quyền thực hiện.");
        }

        if (newState == TicketState.RESOLVED || newState == TicketState.DONE) {
            ticket.setTimeResolved(new Timestamp(System.currentTimeMillis()));
        } else {
            ticket.setTimeResolved(null);
        }

        ticket.setTicketState(newState);
        ticketRepository.save(ticket);

        // Notify the CUSTOMER once the AGENT marks their ticket as "PROCESSING" (AGENT self assigns to ticket)
        if (isAgent && newState == TicketState.PROCESSING) {
            User creator = ticket.getTicketCreator();
            notificationService.notifyUserByTemplate(
                    creator.getId(),
                    NotificationType.SUPPORT_TICKET_UPDATE,
                    "TICKET_PROCESSING_CUSTOMER",
                    ticket.getTitle()
            );
        }

        // Notify the CUSTOMER once the AGENT marks their ticket as "RESOLVED"
        if (isAgent && newState == TicketState.RESOLVED) {
            User creator = ticket.getTicketCreator();
            notificationService.notifyUserByTemplate(
                    creator.getId(),
                    NotificationType.SUPPORT_TICKET_RESOLVED,
                    "TICKET_RESOLVED_CUSTOMER",
                    ticket.getTitle()
            );
        }

        // Notify the CUSTOMER once the AGENT marks their ticket as "DONE"
        if (isAgent && newState == TicketState.DONE) {
            User creator = ticket.getTicketCreator();
            notificationService.notifyUserByTemplate(
                    creator.getId(),
                    NotificationType.SUPPORT_TICKET_RESOLVED,
                    "TICKET_CLOSED_CUSTOMER",
                    ticket.getTitle()
            );
        }

        // Notify the AGENT once the CUSTOMER changes the ticket back to "PROCESSING"
        if (isCustomer && newState == TicketState.PROCESSING) {
            User agent = ticket.getAssignee();
            if (agent != null) {
                notificationService.notifyUserByTemplate(
                        agent.getId(),
                        NotificationType.SUPPORT_TICKET_UPDATE,
                        "TICKET_REOPENED_AGENT",
                        ticket.getTitle()
                );
            }
        }

        // Notify the AGENT once the CUSTOMER changes the ticket to "DONE"
        if (isCustomer && newState == TicketState.DONE) {
            User agent = ticket.getAssignee();
            if (agent != null) {
                notificationService.notifyUserByTemplate(
                        agent.getId(),
                        NotificationType.SUPPORT_TICKET_RESOLVED,
                        "TICKET_CLOSED_AGENT",
                        ticket.getTitle()
                );
            }
        }
        return ticket;
    }
}