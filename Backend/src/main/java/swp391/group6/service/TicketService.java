package swp391.group6.service;

import jakarta.transaction.Transactional;
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

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository){
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    // UC 16: Customer creates a ticket
    public Ticket createTicket(TicketRequest request) {
        if(request.getDetail() == null || request.getDetail().isBlank()){
            return null;
        }

        Optional<User> creator = userRepository.findById(request.getCreatorId());

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDetail(request.getDetail());
        ticket.setTicketType(request.getTicketType());
        ticket.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));

        // Default values for a brand new ticket
        creator.ifPresent(ticket::setTicketCreator);
        ticket.setTicketState(TicketState.CREATED);
        ticket.setTimeCreated(new Timestamp(System.currentTimeMillis()));

        ticketRepository.save(ticket);
        return ticket;
    }

    // UC 12 & 16: Customer/Agent views tickets
    public List<Ticket> getAuthorizedTickets(long userId) {
        // Todo: Make tickets filterable by state
        return new ArrayList<>(ticketRepository.findTicketsByCreatorOrAssignee(userId));
    }

    public List<Ticket> getAuthorizedTicketsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

        return ticketRepository.findTicketsByCreatorOrAssignee(user.getId());
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