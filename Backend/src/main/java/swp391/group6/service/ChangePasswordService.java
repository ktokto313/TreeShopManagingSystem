package swp391.group6.service;

import swp391.group6.dto.ChangePasswordRequest;
import swp391.group6.model.User;
import swp391.group6.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ChangePasswordService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public ChangePasswordService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public enum Result { SUCCESS, NO_PASSWORD, WRONG_OLD_PASSWORD, INVALID_INPUT }

    //CHANGE PASSWORD
    public Result changePassword(String email, ChangePasswordRequest req) {
        if (req.getOldPassword() == null || req.getOldPassword().isBlank()
                || req.getNewPassword() == null || req.getNewPassword().isBlank()) {
            return Result.INVALID_INPUT;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return Result.INVALID_INPUT;

        // Google SSO users have no password
        if (user.getPassword() == null) return Result.NO_PASSWORD;

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            return Result.WRONG_OLD_PASSWORD;
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return Result.SUCCESS;
    }

    //RESET PASSWORD (forgot password)
    public boolean resetPassword(String email, String newPassword) {

        if (newPassword == null || newPassword.isBlank()) {
            return false;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;

        if (user.getPassword() == null) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return true;
    }
}