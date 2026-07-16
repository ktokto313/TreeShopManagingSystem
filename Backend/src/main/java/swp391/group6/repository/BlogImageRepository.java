/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogImageRepository.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-07
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.BlogImage;

import java.util.List;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {

    List<BlogImage> findByPostIdOrderByIdAsc(long postId);

    List<BlogImage> findByPostIdAndPendingTrue(long postId);
    List<BlogImage> findByPostIdAndPendingFalse(long postId);

    @Modifying
    @Query("UPDATE BlogImage i SET i.pending = false WHERE i.post.id = :postId AND i.pending = true")
    void markPendingAsLive(@Param("postId") long postId);
}