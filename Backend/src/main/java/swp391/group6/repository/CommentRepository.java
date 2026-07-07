/*
 * Author: PlotChat
 * Created Date: 2026-06-08
 * Name: CommentRepository.java
 * Description: 
 * Last Change Author: PlotChat
 * Last Change Date: 2026-06-08
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long>{
    List<Comment> findByTicketId(long ticket);
}