/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: RagDocumentRepository.java
 * Description: Repository for RagDocument entity
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import swp391.group6.model.RagDocument;
import java.util.List;
import java.util.Optional;

@Repository
public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {

    List<RagDocument> findBySourceType(String sourceType);

    Optional<RagDocument> findBySourceTypeAndSourceId(String sourceType, Long sourceId);

    @Query(value = """
        SELECT * FROM rag_documents
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<RagDocument> findSimilarDocuments(@Param("embedding") String embedding, @Param("limit") int limit);

    void deleteBySourceTypeAndSourceId(String sourceType, Long sourceId);
}
