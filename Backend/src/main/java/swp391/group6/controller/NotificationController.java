package swp391.group6.controller;

import swp391.group6.model.Notification;
import swp391.group6.repository.NotificationRepository;
import swp391.group6.service.NotificationService;
import swp391.group6.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public NotificationController(NotificationRepository notificationRepository,
                                  NotificationService notificationService) {
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal User currentUser) {
        List<Notification> notifications =
                notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = notificationRepository.countByRecipientUserIdAndIsReadFalse(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !notification.getRecipientUserId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        List<Notification> notifications =
                notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUser.getId());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }

    }