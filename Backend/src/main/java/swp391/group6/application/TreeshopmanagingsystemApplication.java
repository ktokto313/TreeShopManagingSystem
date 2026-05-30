package swp391.group6.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication(scanBasePackages = "swp391.group6")
@EntityScan(basePackages = "swp391.group6.model")
public class TreeshopmanagingsystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(TreeshopmanagingsystemApplication.class, args);
	}

}
