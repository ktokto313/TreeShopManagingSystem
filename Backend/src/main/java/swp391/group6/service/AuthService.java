/*
 * Author: Hung Dao
 * Created Date: 2026-05-30
 * Name: AuthService.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-07
 */
//6/7: Hung Dao: Add handler for user who create account via GoogleSSO try to log in normally
//Add login rate limiting - block after 5 failed attempts in 5 min, escalating 30s block
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

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long ATTEMPT_WINDOW_MS = 5 * 60 * 1000L; // 5 minutes
    private static final long BASE_BLOCK_MS = 30 * 1000L;         // 30 seconds

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // email -> attempt tracking, in-memory (same pattern as OtpService's ConcurrentHashMap)
    private final Map<String, LoginAttemptInfo> loginAttempts = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public LoginResponse login(LoginRequest request, String clientIp) {
        String email = request.getEmail();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            registerFailedAttempt(clientIp);
            return null;
        }

        if (user.getPassword() == null) {
            registerFailedAttempt(clientIp);
            return null;
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            registerFailedAttempt(clientIp);
            return null;
        }

        if (!user.isStatus()) {
            registerFailedAttempt(clientIp);
            return null;
        }

        // successful login clears any tracked failures for this IP
        loginAttempts.remove(clientIp);

        String role = user.getRole() != null ? user.getRole().getName() : "CUSTOMER";
        return new LoginResponse(user.getEmail(), user.getFullName(), role);
    }

    public boolean isBlocked(String clientIp) {
        LoginAttemptInfo info = loginAttempts.get(clientIp);
        return info != null && info.blockedUntil > System.currentTimeMillis();
    }

    public long getRemainingBlockSeconds(String clientIp) {
        LoginAttemptInfo info = loginAttempts.get(clientIp);
        if (info == null) return 0;
        long remaining = info.blockedUntil - System.currentTimeMillis();
        return remaining > 0 ? (remaining + 999) / 1000 : 0;
    }

    private void registerFailedAttempt(String clientIp) {
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

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

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