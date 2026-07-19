/*
 * Author: Hung Dao
 * Created Date: 2026-05-30
 * Name: AuthController.java
 * Description: Handles login and secure logout via JWT HTTP cookies using CookieUtil.
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-06-24
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import swp391.group6.dto.*;
import swp391.group6.model.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import swp391.group6.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.service.ChangePasswordService;
import swp391.group6.service.GoogleAuthService;
import swp391.group6.service.OtpService;
import swp391.group6.service.OtpService.OtpType;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final OtpService otpService;
    private final ChangePasswordService changePasswordService;
    private final Map<String, Boolean> verifiedReset = new ConcurrentHashMap<>();

    public AuthController(AuthService authService,
                          GoogleAuthService googleAuthService,
                          OtpService otpService,
                          ChangePasswordService changePasswordService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.otpService = otpService;
        this.changePasswordService = changePasswordService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse response) {
        String clientIp = resolveClientIp(httpRequest);

        if (authService.isGoogleAccount(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (authService.isBlocked(clientIp)) {
            long remaining = authService.getRemainingBlockSeconds(clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "message", "Too many failed attempts. Try again later.",
                            "remainingSeconds", remaining
                    ));
        }

        LoginResponse loginResponse = authService.login(request, clientIp);
        if (loginResponse == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String jwt = JWTUtil.createToken(loginResponse);
        ResponseCookie cookie = CookieUtil.makeCookieFromJWT(jwt);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {

        User user = authService.register(request);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<?> sendRegisterOtp(@RequestBody OtpRequest request) {
        if (authService.emailExists(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        otpService.generateAndSend(request.getEmail(), OtpType.REGISTER);
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }


    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegisterOtp(@RequestBody OtpRequest request) {
        boolean valid = otpService.verify(
                request.getEmail(),
                request.getOtp(),
                OtpType.REGISTER
        );

        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request,
                                         HttpServletResponse response) {
        try {
            return ResponseEntity.ok(
                    googleAuthService.handleGoogleLogin(request.getCredential(), response)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/google/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody CompleteProfileRequest request,
                                             HttpServletResponse response) {
        googleAuthService.completeGoogleProfile(request, response);
        return ResponseEntity.ok(Map.of("success", true));
    }

    //FORGOT PASSWORD

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendResetOtp(@RequestBody OtpRequest request) {
        if (authService.isGoogleAccount(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "This account uses Google login"));
        }

        if (!authService.emailExists(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Email not found"));
        }

        otpService.generateAndSend(request.getEmail(), OtpType.RESET_PASSWORD);

        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyResetOtp(@RequestBody OtpRequest request) {

        boolean valid = otpService.verify(
                request.getEmail(),
                request.getOtp(),
                OtpType.RESET_PASSWORD
        );

        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        verifiedReset.put(request.getEmail(), true);

        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {

        if (!verifiedReset.getOrDefault(request.getEmail(), false)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "OTP not verified"));
        }

        boolean success = changePasswordService.resetPassword(
                request.getEmail(),
                request.getNewPassword()
        );

        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Reset password failed"));
        }

        verifiedReset.remove(request.getEmail());

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    //LOGOUT

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        ResponseCookie deadCookie = CookieUtil.invalidateCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deadCookie.toString())
                .body("Logged out successfully");
    }
}
