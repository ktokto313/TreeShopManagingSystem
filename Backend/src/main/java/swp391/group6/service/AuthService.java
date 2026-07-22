/*
 * Author: HungDLM
 * Created Date: 2026-06-26
 * Name: BlogService.java
 * Description:
 * Last Change Author: HungDLM
 * Last Change Date: 2026-07-20
 */
package swp391.group6.service;

import swp391.group6.dto.LoginRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.RegisterRequest;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.sql.Timestamp;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    // BR-01: If a user inputs incorrect login details 5 times continuously,
    // the system will temporarily lock their login action for 30s, time increases by 30s per locked time.
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long ATTEMPT_WINDOW_MS = 5 * 60 * 1000L; // 5 minutes
    private static final long BASE_BLOCK_MS = 30 * 1000L;         // 30 seconds

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    // BR-19: passwords are hashed/verified using BCrypt via this encoder.
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, LoginAttemptInfo> loginAttempts = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // BR-01: If a user inputs incorrect login details 5 times continuously,
    // the system will temporarily lock their login action for 30s, time increases by 30s per locked time.
    // BR-19: password check uses passwordEncoder.matches against a BCrypt hash.
    // Authenticate user with email/password.
    public LoginResponse login(LoginRequest request, String clientIp) {
        String email = request.getEmail();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            recordFailedAttempt(clientIp);
            return null;
        }

        if (user.getPassword() == null) {
            recordFailedAttempt(clientIp);
            return null;
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            recordFailedAttempt(clientIp);
            return null;
        }

        if (!user.isStatus()) {
            recordFailedAttempt(clientIp);
            return null;
        }

        // successful login clears any tracked failures for this IP
        loginAttempts.remove(clientIp);

        String role = user.getRole() != null ? user.getRole().getName() : "CUSTOMER";
        return new LoginResponse(user.getEmail(), user.getFullName(), role);
    }

    // BR-01: If a user inputs incorrect login details 5 times continuously,
    // the system will temporarily lock their login action for 30s, time increases by 30s per locked time.
    // Check whether a client IP is currently blocked due to too many failed login attempts.
    public boolean isBlocked(String clientIp) {
        LoginAttemptInfo info = loginAttempts.get(clientIp);
        return info != null && info.blockedUntil > System.currentTimeMillis();
    }

    // BR-01: If a user inputs incorrect login details 5 times continuously,
    // the system will temporarily lock their login action for 30s, time increases by 30s per locked time.
    // Get remaining block time (in seconds) for a blocked client IP.
    public long getRemainingBlockSeconds(String clientIp) {
        LoginAttemptInfo info = loginAttempts.get(clientIp);
        if (info == null) return 0;
        long remaining = info.blockedUntil - System.currentTimeMillis();
        return remaining > 0 ? (remaining + 999) / 1000 : 0;
    }

    // BR-01: If a user inputs incorrect login details 5 times continuously,
    // the system will temporarily lock their login action for 30s, time increases by 30s per locked time.
    // Record a failed login attempt for a client IP.
    private void recordFailedAttempt(String clientIp) {
        long now = System.currentTimeMillis();
        loginAttempts.compute(clientIp, (key, info) -> {
            if (info == null || now - info.windowStart > ATTEMPT_WINDOW_MS) {
                info = new LoginAttemptInfo();
                info.windowStart = now;
            }
            info.failedCount++;
            if (info.failedCount >= MAX_FAILED_ATTEMPTS) {
                info.blockCount++;
                info.blockedUntil = now + info.blockCount * BASE_BLOCK_MS;
                info.failedCount = 0;
                info.windowStart = now;
            }
            System.out.println("IP=" + clientIp + " failedCount=" + info.failedCount + " blockCount=" + info.blockCount);
            return info;
        });

    }

    // BR-19: new user's password is stored via passwordEncoder.encode (BCrypt hash).
    // Register a new user with encrypted password and default CUSTOMER role.
    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return null;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setStatus(true);

        Role role = roleRepository.findByName("CUSTOMER")
                .orElse(null);

        if (role == null) {
            return null;
        }

        user.setRole(role);

        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return userRepository.save(user);
    }

    // Check if an email already exists in the system.
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // Determine whether an account is a Google account (no password stored).
    public boolean isGoogleAccount(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getPassword() == null)
                .orElse(false);
    }

    private static class LoginAttemptInfo {
        long windowStart;
        int failedCount;
        int blockCount;
        long blockedUntil;
    }
}