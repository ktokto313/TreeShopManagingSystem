package swp391.group6.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

// scanBasePackages required because main class is in .application subpackage
// EntityScan scoped to model/ where all JPA entities live
// EnableJpaRepositories scoped to repository/ where all Spring Data interfaces live
@SpringBootApplication(scanBasePackages = "swp391.group6")
@EnableJpaRepositories(basePackages = "swp391.group6.repository")
@EntityScan(basePackages = "swp391.group6.model")
public class TreeshopmanagingsystemApplication {

    // Set timezone before JVM initializes JDBC to prevent PostgreSQL rejecting "Asia/Saigon" on Windows
    static {
        System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
    }

    public static void main(String[] args) {
        SpringApplication.run(TreeshopmanagingsystemApplication.class, args);
    }
}
