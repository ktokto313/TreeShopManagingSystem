/*
 * Author: AnhLV
 * Created Date: 2026-06-05
 * Name: TicketRepository.java
 * Description: Data access interface for ticket persistence and database operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-07-03
 */

package swp391.group6.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import swp391.group6.model.Priority;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByTicketCreator(long id);
    List<Ticket> findByTicketStateNot(TicketState state);
    List<Ticket> findByTicketState(TicketState state);

    @Query("SELECT t FROM Ticket t WHERE t.ticketCreator.id = :userId")
    List<Ticket> findTicketsByCreator(@Param("userId") long userId);

    @Query("SELECT t FROM Ticket t WHERE (t.ticketCreator.id = :userId) " +
            "AND (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)")

    Page<Ticket> findTicketsByCreatorWithFilters(
            @Param("userId") long userId,
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)")
    Page<Ticket> findAllWithFilters(
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)" +
            "AND (t.assignee.id IS NULL OR t.assignee.id = :userId)")
    Page<Ticket> findAllWithFiltersAndIsAssigned(
            @Param("userId") long userId,
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Pageable pageable);
}