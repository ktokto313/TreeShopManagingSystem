/*
 * Author: PlotChat
 * Created Date: 2026-06-01
 * Name: TicketController.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-27
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketRequest ticketRequest, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        Ticket ticket = ticketService.createTicket(ticketRequest, currentUser.getEmail());
        if (ticket == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Ticket>> getAuthorizedTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            Sort sort,
            HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);
        String email = currentUser.getEmail();
        List<Ticket> tickets = ticketService.getAuthorizedTicketsByEmail(email, status, priority, sort);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> getTicketById(@PathVariable long id) {
        Optional<Ticket> ticket = ticketService.getTicketById(id);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable long id,
            @RequestParam String newState,
            HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);
        Ticket updatedTicket = ticketService.updateTicketStatus(id, newState, currentUser);
        if (updatedTicket == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(updatedTicket);
    }
}