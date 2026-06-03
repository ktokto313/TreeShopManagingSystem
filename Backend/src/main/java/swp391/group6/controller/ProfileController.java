package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ProfileResponse;
import swp391.group6.model.User;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {

        LoginResponse jwtUser = JWTUtil.getUser(request);

        if (jwtUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token");
        }

        User user = userService.findByEmail(jwtUser.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        ProfileResponse response = new ProfileResponse(
                user.getEmail(),
                user.getFullName(),
                user.getPhone() != null ? user.getPhone() : "",
                user.isStatus()
        );

        return ResponseEntity.ok(response);
    }
}