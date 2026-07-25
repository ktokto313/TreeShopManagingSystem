/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnEvidenceRepository.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ReturnEvidence;
import swp391.group6.model.ReturnRequest;

import java.util.List;

public interface ReturnEvidenceRepository extends JpaRepository<ReturnEvidence, String> {

    List<ReturnEvidence> findByReturnRequest(ReturnRequest returnRequest);
}
