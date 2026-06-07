package swp391.group6.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import swp391.group6.model.Ticket;
import swp391.group6.dto.TicketRequest;
import swp391.group6.model.*;
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

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // UC 16: Customer creates a ticket
    public Ticket createTicket(TicketRequest request, String userEmail) {
        if (request.getDetail() == null || request.getDetail().isBlank()) {
            return null;
        }

        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDetail(request.getDetail());
        ticket.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));

        // Default values for a brand new ticket
        ticket.setTicketCreator(creator);
        ticket.setTicketState(TicketState.CREATED);
        ticket.setTimeCreated(new Timestamp(System.currentTimeMillis()));

        ticketRepository.save(ticket);
        return ticket;
    }

    // UC 12 & 16: Customer/Agent views tickets
    public List<Ticket> getAuthorizedTickets(long userId) {
        return new ArrayList<>(ticketRepository.findTicketsByCreatorOrAssignee(userId));
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
        return ticketRepository.findTicketsByCreatorOrAssigneeWithFilters(user.getId(), state, priority, sort);
    }

    // UC 12 & 16: Update ticket status (Agent sets to Progress, Customer sets to Resolved)
    public Ticket updateTicketStatus(long ticketId, String newStateStr, Long agentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketState newState = TicketState.valueOf(newStateStr.toUpperCase());
        ticket.setTicketState(newState);

        if (newState == TicketState.RESOLVED || newState == TicketState.DONE) {
            ticket.setTimeResolved(new Timestamp(System.currentTimeMillis()));
        }

        // If an agent is taking the ticket, assign them
        if (agentId != null) {
            User agent = userRepository.findById(agentId).orElse(null);
            ticket.setAssignee(agent);
        }

        ticketRepository.save(ticket);
        return ticket;
    }

    public Optional<Ticket> getTicketById(long id) {
        return ticketRepository.findById(id);
    }
}