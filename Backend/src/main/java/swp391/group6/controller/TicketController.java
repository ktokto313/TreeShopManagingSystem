/*
 * Author: AnhLV
 * Created Date: 2026-06-01
 * Name: TicketController.java
 * Description: REST controller handling HTTP requests and routing for ticket-related operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-03
 */

package swp391.group6.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.TicketRequest;
import swp391.group6.model.Ticket;
import swp391.group6.service.TicketService;
import swp391.group6.util.JWTUtil;

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
    public ResponseEntity<Page<Ticket>> getAuthorizedTickets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            Sort sort,
            HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);
        String email = currentUser.getEmail();
        Pageable pageable = PageRequest.of(page, size, sort != null ? sort : Sort.unsorted());
        Page<Ticket> tickets = ticketService.getAuthorizedTicketsByEmail(email, search, status, priority, pageable);
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