package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.ChangePasswordRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ProfileResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.service.ChangePasswordService;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;
import java.util.Map;
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final ChangePasswordService changePasswordService;

    public ProfileController(UserService userService, ChangePasswordService changePasswordService) {
        this.userService = userService;
        this.changePasswordService = changePasswordService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> getProfile(HttpServletRequest request) {
        LoginResponse jwtUser = JWTUtil.getUser(request);

        UserDTO user = userService.getUserByEmail(jwtUser.getEmail()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UserDTO userDTO,
                                                         HttpServletRequest request) {
        LoginResponse jwtUser = JWTUtil.getUser(request);

        UserDTO currentUser = userService.getUserByEmail(jwtUser.getEmail()).orElse(null);
        if (currentUser == null) return ResponseEntity.notFound().build();

        try {
            UserDTO updatedUser = userService.updateProfile(currentUser.getId(), userDTO);
            if (updatedUser == null) return ResponseEntity.notFound().build();

            return ResponseEntity.ok(toProfileResponse(updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private ProfileResponse toProfileResponse(UserDTO user) {
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();

        return new ProfileResponse(
                user.getEmail(),
                user.getFullName(),
                user.getPhone() != null ? user.getPhone() : "",
                user.getStatus(),
                hasPassword
        );
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req,
                                            HttpServletRequest request) {

        LoginResponse user = JWTUtil.getUser(request);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return switch (changePasswordService.changePassword(user.getEmail(), req)) {
            case SUCCESS -> ResponseEntity.ok().build();
            case NO_PASSWORD -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Google account"));
            case WRONG_OLD_PASSWORD -> ResponseEntity.badRequest()
                    .body(Map.of("message", "Wrong old password"));
            default -> ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid input"));
        };
    }
}