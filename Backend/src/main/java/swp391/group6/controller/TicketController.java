package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Ticket;
import swp391.group6.dto.TicketRequest;
import swp391.group6.service.TicketService;
import swp391.group6.util.JWTUtil;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // Customer creates a ticket
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        if (ticket == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // Agent & Customer views their own tickets
    @GetMapping("/")
    public ResponseEntity<List<Ticket>> getAuthorizedTickets(HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = currentUser.getEmail();
        List<Ticket> tickets = ticketService.getAuthorizedTicketsByEmail(email);

        return ResponseEntity.ok(tickets);
    }

    // View specific ticket details
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable long id) {
        Optional<Ticket> ticket = ticketService.getTicketById(id);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update ticket status
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable long id,
            @RequestParam String newState,
            @RequestParam(required = false) Long agentId) {
        try {
            Ticket updatedTicket = ticketService.updateTicketStatus(id, newState, agentId);
            return ResponseEntity.ok(updatedTicket);
        } catch (IllegalArgumentException e) { // Catches bad enum
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}