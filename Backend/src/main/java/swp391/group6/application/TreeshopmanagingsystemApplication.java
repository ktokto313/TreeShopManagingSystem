package swp391.group6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// scanBasePackages required because main class is in .application subpackage, not the root swp391.group6 package
// EntityScan scoped to model/ where all JPA entities live
// EnableJpaRepositories scoped to repository/ where all Spring Data interfaces live
@SpringBootApplication(scanBasePackages = "swp391.group6")

public class TreeshopmanagingsystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(TreeshopmanagingsystemApplication.class, args);
	}

}
