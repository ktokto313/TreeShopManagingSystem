package swp391.group6.service;

import org.springframework.stereotype.Service;
import swp391.group6.model.User;
import swp391.group6.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}