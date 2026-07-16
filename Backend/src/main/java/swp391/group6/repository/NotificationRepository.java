/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationRepository.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Notification;
import swp391.group6.model.Role;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    List<Notification> findByRecipientRole(Role role);
    long countByRecipientUserIdAndIsReadFalse(Long recipientUserId);
}