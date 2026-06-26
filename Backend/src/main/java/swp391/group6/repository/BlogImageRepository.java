package swp391.group6.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import swp391.group6.model.BlogImage;

import java.util.List;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {

    List<BlogImage> findByPostIdOrderByIdAsc(long postId);
}