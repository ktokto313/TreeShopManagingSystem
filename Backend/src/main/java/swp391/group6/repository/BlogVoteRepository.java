//Create: HungDLM on 26/06/2026
//Lastest update: HungDLM on 26/06/2026
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import swp391.group6.model.BlogVote;
import swp391.group6.model.BlogVoteId;

public interface BlogVoteRepository extends JpaRepository<BlogVote, BlogVoteId> {
    @Query("SELECT COUNT(v) > 0 FROM BlogVote v WHERE v.id.userId = :userId AND v.id.postId = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    @Query("SELECT COUNT(v) FROM BlogVote v WHERE v.id.postId = :postId")
    long countByPostId(@Param("postId") Long postId);

    @Modifying
    @Query("DELETE FROM BlogVote v WHERE v.id.userId = :userId AND v.id.postId = :postId")
    void deleteByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);
}