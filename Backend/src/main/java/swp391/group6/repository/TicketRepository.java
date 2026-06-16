package swp391.group6.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.Priority;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByTicketCreator(long id);
    List<Ticket> findByTicketStateNot(TicketState state);

    @Query("SELECT t FROM Ticket t WHERE t.ticketCreator.id = :userId")
    List<Ticket> findTicketsByCreator(@Param("userId") long userId);

    @Query("SELECT t FROM Ticket t WHERE (t.ticketCreator.id = :userId) " +
            "AND (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)")

    List<Ticket> findTicketsByCreatorWithFilters(
            @Param("userId") long userId,
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Sort sort);

    @Query("SELECT t FROM Ticket t WHERE (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)")
    List<Ticket> findAllWithFilters(
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Sort sort);

    @Query("SELECT t FROM Ticket t WHERE (:state IS NULL OR t.ticketState = :state) " +
            "AND (:priority IS NULL OR t.priority = :priority)" +
            "AND (t.assignee.id IS NULL OR t.assignee.id = :userId)")
    List<Ticket> findAllWithFiltersAndIsAssigned(
            @Param("userId") long userId,
            @Param("state") TicketState state,
            @Param("priority") Priority priority,
            Sort sort);
}