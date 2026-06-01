package swp391.group6.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import swp391.group6.dto.LoginRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);

        if (loginResponse == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body
                    (new LoginResponse("Invalid email or password"));

        Cookie cookie = new Cookie("jwt", loginResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ResponseEntity.ok(new LoginResponse(
                null,
                loginResponse.getEmail(),
                loginResponse.getFullName(),
                loginResponse.getRole()
        ));
    }
}
