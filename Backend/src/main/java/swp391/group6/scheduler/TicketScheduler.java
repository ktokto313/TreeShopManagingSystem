/*
 * Author: AnhLV
 * Created Date: 2026-07-15
 * Name: TicketScheduler.java
 * Description: Scheduler handling scheduled operations.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-08-01
 */

package swp391.group6.scheduler;

import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import swp391.group6.model.NotificationType;
import swp391.group6.model.Ticket;
import swp391.group6.model.TicketState;
import swp391.group6.repository.TicketRepository;
import swp391.group6.service.NotificationService;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class TicketScheduler {
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public TicketScheduler(TicketRepository ticketRepository, NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedDelay = 1, timeUnit = TimeUnit.DAYS)
    @Transactional
    public void autoCloseResolvedTickets() {
        List<Ticket> resolvedTickets = ticketRepository.findByTicketState(TicketState.RESOLVED);
         long threeDaysInMillis = TimeUnit.DAYS.toMillis(3);

         // FOR TESTING:
         // long threeDaysInMillis = TimeUnit.SECONDS.toMillis(15);
        long currentTime = System.currentTimeMillis();
        
        for (Ticket ticket : resolvedTickets) {
            if (ticket.getTimeResolved() != null && (currentTime - ticket.getTimeResolved().getTime() >= threeDaysInMillis)) {
                ticket.setTicketState(TicketState.DONE);
                // Note: Not setting timeResolved to a new time here, as it indicates when it was actually resolved. 
                // DONE just means it's closed.
                ticketRepository.save(ticket);
                
                if (ticket.getTicketCreator() != null) {
                    notificationService.notifyUserByTemplate(
                            ticket.getTicketCreator().getId(),
                            NotificationType.SUPPORT_TICKET_UPDATE,
                            "TICKET_AUTOCLOSED_CUSTOMER",
                            ticket.getTitle()
                    );
                }
            }
        }
    }
}
