/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationService.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-20
 */
package swp391.group6.service;

import swp391.group6.model.Notification;
import swp391.group6.model.NotificationTemplate;
import swp391.group6.model.NotificationType;
import swp391.group6.repository.NotificationRepository;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               RoleRepository roleRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    //Raw versions

    // BR-77: sends a notification to a specific user
    // BR-78: the created Notification shall have a read/unread status and starts as unread.
    @Async
    public void notifyUser(Long userId, NotificationType type,
                           String subject, String content) {
        Notification notification = buildNotification(type, subject, content);
        notification.setRecipientUserId(userId);
        notificationRepository.save(notification);
    }

    // BR-77: sends a notification to a specific user
    @Async
    public void notifyRole(String roleName, NotificationType type,
                           String subject, String content) {
        Role role = roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không xác định: " + roleName));

        List<User> recipients = userRepository.findByRole_Name(role.getName());

        for (User recipient : recipients) {
            Notification notification = buildNotification(type, subject, content);
            notification.setRecipientRole(role);
            notification.setRecipientUserId(recipient.getId());
            notificationRepository.save(notification);
        }
    }

    //Template versions
    @Async
    public void notifyUserByTemplate(Long userId, NotificationType type,
                                     String templateKey, Object... args) {
        String subject = NotificationTemplate.subject(templateKey);
        String content = NotificationTemplate.body(templateKey, args);
        notifyUser(userId, type, subject, content);
    }
    @Async
    public void notifyRoleByTemplate(String roleName, NotificationType type,
                                     String templateKey, Object... args) {
        String subject = NotificationTemplate.subject(templateKey);
        String content = NotificationTemplate.body(templateKey, args);
        notifyRole(roleName, type, subject, content);
    }

    private Notification buildNotification(NotificationType type, String subject, String content) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setSubject(subject);
        notification.setContent(content);
        return notification;
    }
}