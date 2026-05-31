package swp391.group6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TreeshopmanagingsystemApplication {

	static {
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
	}

	public static void main(String[] args) {
		SpringApplication.run(TreeshopmanagingsystemApplication.class, args);
	}

}
