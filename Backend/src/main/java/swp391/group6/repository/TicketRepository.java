package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByTicketCreator(long id);
    List<Ticket> findByTicketStateNot(TicketState state);

    @Query("SELECT t FROM Ticket t WHERE t.ticketCreator.id = :userId OR t.assignee.id = :userId")
    List<Ticket> findTicketsByCreatorOrAssignee(@Param("userId") long userId);
}