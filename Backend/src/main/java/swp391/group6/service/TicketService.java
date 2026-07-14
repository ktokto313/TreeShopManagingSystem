/*
 * Author: AnhLV
 * Created Date: 2026-06-05
 * Name: TicketService.java
 * Description: Service layer component handling business logic for tickets.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-03
 */
/*
 * Author: PlotChat
 * Created Date: 2026-06-01
 * Name: TicketService.java
 * Description:
 * Last Change Author: Aiden
 * Last Change Date: 2026-06-18
 */
package swp391.group6.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Ticket;
import swp391.group6.dto.TicketRequest;
import swp391.group6.model.*;
import swp391.group6.model.NotificationType;
import swp391.group6.repository.TicketRepository;
import swp391.group6.repository.UserRepository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService; // ticket notification triggers

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // UC 16: Customer creates a ticket
    public Ticket createTicket(TicketRequest request, String userEmail) {
        if (request.getDetail() == null || request.getDetail().isBlank()) {
            return null;
        }

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!creator.getRole().getName().equalsIgnoreCase("customer")) {
            throw new RuntimeException("User not allowed to create tickets.");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDetail(request.getDetail());
        ticket.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));

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

        return ticket;
    }

    // UC 12 & 16: Customer/Agent views tickets
    public List<Ticket> getAuthorizedTickets(long userId) {
        return new ArrayList<>(ticketRepository.findTicketsByCreator(userId));
    }

    public List<Ticket> getAuthorizedTicketsByEmail(String email, String statusStr, String priorityStr, Sort sort) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        // Safely convert strings to Enums, leaving them as null if the frontend didn't send them
        TicketState state = (statusStr != null && !statusStr.isBlank())
                ? TicketState.valueOf(statusStr.toUpperCase()) : null;

        Priority priority = (priorityStr != null && !priorityStr.isBlank())
                ? Priority.valueOf(priorityStr.toUpperCase()) : null;

        // Pass everything to the repository
        List<Ticket> ticketsResult = null;
        if (user.getRole().getId() == 1) { // Id of customer
            ticketsResult = ticketRepository.findTicketsByCreatorWithFilters(user.getId(), state, priority, sort);
        } else if (user.getRole().getId() == 4) { // Id of support agent
            ticketsResult = ticketRepository.findAllWithFiltersAndIsAssigned(user.getId(), state, priority, sort);
        }

        return ticketsResult;
    }

    // UC 12 & 16: Update ticket status (Agent sets to Progress, Customer sets to Resolved)
    public Ticket updateTicketStatus(long ticketId, String newStateStr, LoginResponse currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketState newState = TicketState.valueOf(newStateStr.toUpperCase());
        TicketState originalState = ticket.getTicketState();

        if (newState == originalState) {
            throw new RuntimeException("Ticket is already in state: " + newStateStr);
        }
        if (newState == TicketState.CREATED) {
            throw new RuntimeException("Cannot revert ticket back to CREATED state.");
        }
        if (originalState == TicketState.DONE) {
            throw new RuntimeException("Cannot modify a ticket that is already DONE.");
        }

        String userEmail = currentUser.getEmail();

        boolean isAgent = currentUser.getRole().equals("SUPPORT_AGENT");
        boolean isCustomer = currentUser.getRole().equals("CUSTOMER");

        boolean isCreator = ticket.getTicketCreator().getEmail().equals(userEmail);
        boolean notAssigned = ticket.getAssignee() == null && userEmail != null;

        if (isAgent) {
            // If nobody is assigned to the ticket, let current agent get assigned to it
            if (notAssigned) {
                User agent = userRepository.findByEmail(userEmail).orElse(null);
                ticket.setAssignee(agent);
            }

            // If someone owns it, verify it is the current agent making the request.
            else if (!ticket.getAssignee().getEmail().equals(userEmail)) {
                throw new RuntimeException("Cannot modify a ticket assigned to another support agent.");
            }

            // Enforce Agent Paths from Diagram
            if (originalState == TicketState.CREATED && newState != TicketState.PROCESSING) {
                throw new RuntimeException("Agent can only transition a CREATED ticket to PROCESSING.");
            }
            if (originalState == TicketState.PROCESSING && (newState != TicketState.RESOLVED && newState != TicketState.DONE)) {
                throw new RuntimeException("Agent can only transition a PROCESSING ticket to RESOLVED or DONE (reject).");
            }
            if (originalState == TicketState.RESOLVED) {
                throw new RuntimeException("Agent cannot modify a RESOLVED ticket. Awaiting customer confirmation.");
            }

        } else if (isCustomer) {
            if (!isCreator) {
                throw new RuntimeException("Cannot modify a ticket you did not create.");
            }

            // Enforce Customer Paths from Diagram
            if (originalState != TicketState.RESOLVED) {
                throw new RuntimeException("Customer can only update the ticket state when it requires resolution feedback (RESOLVED).");
            }
            if (newState != TicketState.DONE && newState != TicketState.PROCESSING) {
                throw new RuntimeException("Customer can only ACCEPT (Done) or REJECT (Processing) the resolution.");
            }
        } else {
            throw new RuntimeException("Unauthorized role.");
        }

        if (newState == TicketState.RESOLVED || newState == TicketState.DONE) {
            ticket.setTimeResolved(new Timestamp(System.currentTimeMillis()));
        } else {
            ticket.setTimeResolved(null);
        }

        ticket.setTicketState(newState);
        ticketRepository.save(ticket);

        // Notify the customer once the agent marks their ticket as resolved and awaiting confirmation.
        if (isAgent && newState == TicketState.PROCESSING) {
            User creator = ticket.getTicketCreator();
            notificationService.notifyUserByTemplate(
                    creator.getId(),
                    NotificationType.SUPPORT_TICKET_UPDATE,
                    "TICKET_PROCESSING_CUSTOMER",
                    ticket.getTitle()
            );
        }

        if (isAgent && newState == TicketState.RESOLVED) {
            User creator = ticket.getTicketCreator();
            notificationService.notifyUserByTemplate(
                    creator.getId(),
                    NotificationType.SUPPORT_TICKET_RESOLVED,
                    "TICKET_RESOLVED_CUSTOMER",
                    ticket.getTitle()
            );
        }

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
        return ticket;
    }

    public Optional<Ticket> getTicketById(long id) {
        return ticketRepository.findById(id);
    }
}