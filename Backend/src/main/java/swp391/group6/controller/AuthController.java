package swp391.group6.controller;

import swp391.group6.dto.*;
import swp391.group6.model.User;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import swp391.group6.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.service.GoogleAuthService;
import swp391.group6.service.OtpService;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    private final OtpService otpService;

    public AuthController(AuthService authService, GoogleAuthService googleAuthService, OtpService otpService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.otpService = otpService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        if (authService.isGoogleAccount(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // 403
        }

        LoginResponse loginResponse = authService.login(request);
        if (loginResponse == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401

        String jwt = JWTUtil.createToken(loginResponse);
        ResponseCookie cookie = CookieUtil.makeCookieFromJWT(jwt);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(loginResponse);
    }
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {

        User user = authService.register(request);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request,
                                         HttpServletResponse response) {
        try {
            return ResponseEntity.ok(googleAuthService.handleGoogleLogin(request.getCredential(), response));
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

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        // check if email already exists
        if (authService.emailExists(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }
        otpService.generateAndSend(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        boolean valid = otpService.verify(request.getEmail(), request.getOtp());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }
        return ResponseEntity.ok(Map.of("message", "OTP verified"));
    }
}
