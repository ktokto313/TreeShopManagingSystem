//Create: HungDLM on 26/06/2026
//Lastest update: HungDLM on 26/06/2026
package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.BlogImage;

import java.util.List;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {

    List<BlogImage> findByPostIdOrderByIdAsc(long postId);
}