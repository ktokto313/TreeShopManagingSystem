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
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;
    public AuthController(AuthService authService, GoogleAuthService googleAuthService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);

        if (loginResponse == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

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
        return ResponseEntity.ok(googleAuthService.handleGoogleLogin(request.getCredential(), response));
    }

    @PostMapping("/google/complete-profile")
    public ResponseEntity<?> completeProfile(@RequestBody CompleteProfileRequest request,
                                             HttpServletResponse response) {
        googleAuthService.completeGoogleProfile(request, response);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
