/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogPostRepository.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-27
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.*;

import java.sql.Timestamp;
import java.util.List;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    List<BlogPost> findByStatusOrderByCreatedAtDesc(BlogStatus status);
    List<BlogPost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    BlogPost findByIdAndAuthorId(long id, long authorId);

    @Modifying
    @Query("DELETE FROM BlogPost p WHERE p.status = :status AND p.updatedAt < :cutoff")
    int deleteByStatusAndUpdatedAtBefore(
            @Param("status") BlogStatus status,
            @Param("cutoff") Timestamp cutoff
    );
}