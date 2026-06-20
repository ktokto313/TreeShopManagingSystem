package swp391.group6.service;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import swp391.group6.dto.LoginResponse;
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

        String userEmail = currentUser.getEmail();

        boolean isAgent = currentUser.getRole().equals("SUPPORT_AGENT");
        boolean isCustomer = currentUser.getRole().equals("CUSTOMER");

        boolean isCreator = ticket.getTicketCreator().getEmail().equals(userEmail);
        boolean notAssigned = ticket.getAssignee() == null && userEmail != null;
        boolean isTheAssignedAgent = !notAssigned && ticket.getAssignee().getEmail().equals(userEmail);

        if (isAgent) {
            // If the ticket is unassigned, assign the agent changing the ticket
            if (notAssigned) {
                User agent = userRepository.findByEmail(userEmail).orElse(null);
                ticket.setAssignee(agent);

            } else if (!isTheAssignedAgent) {
                throw new RuntimeException("Cannot assign to a ticket with an already assigned support agent");
            }
        } else if (isCustomer) {
            if (!isCreator) throw new RuntimeException("Cannot accept/decline ticket status when user is not the creator");
            if (newState != TicketState.DONE && newState != TicketState.PROCESSING) {
                throw new RuntimeException("Cannot accept ticket into this state: " + newState);
            }
            if(originalState == TicketState.DONE){
                throw new RuntimeException("Cannot accept ticket when ticket state is DONE");
            }
        }


        if (newState == TicketState.RESOLVED || newState == TicketState.DONE) {
            ticket.setTimeResolved(new Timestamp(System.currentTimeMillis()));
        } else {
            ticket.setTimeResolved(null);
        }

        ticket.setTicketState(newState);
        ticketRepository.save(ticket);
        return ticket;
    }

    public Optional<Ticket> getTicketById(long id) {
        return ticketRepository.findById(id);
    }
}