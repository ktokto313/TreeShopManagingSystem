/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationSẻvice.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
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

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public NotificationService(JavaMailSender mailSender,
                               NotificationRepository notificationRepository,
                               RoleRepository roleRepository,
                               UserRepository userRepository) {
        this.mailSender = mailSender;
        this.notificationRepository = notificationRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    //Raw versions

    @Async
    public void notifyUser(Long userId, String email, NotificationType type,
                           String subject, String content) {
        Notification notification = buildNotification(type, subject, content);
        notification.setRecipientUserId(userId);
        sendAndSave(notification, email);
    }

    @Async
    public void notifyRole(String roleName, NotificationType type,
                           String subject, String content) {
        Role role = roleRepository.findByNameIgnoreCase(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName));

        List<User> recipients = userRepository.findByRole_Name(role.getName());

        for (User recipient : recipients) {
            Notification notification = buildNotification(type, subject, content);
            notification.setRecipientRole(role);
            notification.setRecipientUserId(recipient.getId());
            sendAndSave(notification, recipient.getEmail());
        }
    }

    //Template versions
    @Async
    public void notifyUserByTemplate(Long userId, String email, NotificationType type,
                                     String templateKey, Object... args) {
        String subject = NotificationTemplate.subject(templateKey);
        String content = NotificationTemplate.body(templateKey, args);
        notifyUser(userId, email, type, subject, content);
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

    private void sendAndSave(Notification notification, String recipientEmail) {
        notification.setRecipientEmail(recipientEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(notification.getSubject());
            message.setText(notification.getContent());
            mailSender.send(message);
            notification.setSentViaEmail(true);
        } catch (Exception e) {
            // BR: email failure must not block the triggering transaction
            notification.setEmailSendFailed(true);
        }
        notificationRepository.save(notification);
    }
}