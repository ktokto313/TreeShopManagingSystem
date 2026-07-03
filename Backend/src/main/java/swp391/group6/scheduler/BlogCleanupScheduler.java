package swp391.group6.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.model.BlogStatus;
import swp391.group6.repository.BlogPostRepository;

import java.sql.Timestamp;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class BlogCleanupScheduler {

    private final BlogPostRepository postRepo;

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    @Transactional
    public void deleteExpiredDrafts() {
        Timestamp cutoff = new Timestamp(System.currentTimeMillis() - 12L * 60 * 60 * 1000);
        int deleted = postRepo.deleteByStatusAndUpdatedAtBefore(BlogStatus.DRAFT, cutoff);
        if (deleted > 0) {
            log.info("Auto-deleted {} expired draft(s)", deleted);
        }
    }
}