/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogImageRepository.java
 * Description: 
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-27
 */
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.BlogImage;

import java.util.List;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {

    List<BlogImage> findByPostIdOrderByIdAsc(long postId);
}