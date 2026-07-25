/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestItemRepository.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.ReturnRequest;
import swp391.group6.model.ReturnRequestItem;

import java.util.List;

public interface ReturnRequestItemRepository extends JpaRepository<ReturnRequestItem, String> {

    List<ReturnRequestItem> findByReturnRequest(ReturnRequest returnRequest);
}
