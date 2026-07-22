/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationController.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-20
 */
package swp391.group6.controller;

import swp391.group6.model.Notification;
import swp391.group6.repository.NotificationRepository;
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

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // BR-77: a notification is sent to (and here, retrieved for) a specific user
    // Get all notifications of the currently authenticated user, ordered by newest first.
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal User currentUser) {
        List<Notification> notifications =
                notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    // BR-78: each notification has a read/unread status
    // Get total number of unread notifications for current user.
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = notificationRepository.countByRecipientUserIdAndIsReadFalse(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // BR-78: each notification has a read/unread status
    // Mark a specific notification as read if it belongs to current user.
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

    // BR-78: each notification has a read/unread status
    // Mark all notifications of current user as read in bulk.
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        List<Notification> notifications =
                notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(currentUser.getId());
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }

}