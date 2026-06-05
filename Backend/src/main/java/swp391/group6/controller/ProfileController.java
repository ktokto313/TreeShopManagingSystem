package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.ProfileResponse;
import swp391.group6.dto.UserDTO;
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
    public ResponseEntity<ProfileResponse> getProfile(HttpServletRequest request) {

        LoginResponse jwtUser = JWTUtil.getUser(request);

        UserDTO user = userService.getUserByEmail(jwtUser.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        ProfileResponse response = new ProfileResponse(
                user.getEmail(),
                user.getFullName(),
                user.getPhone() != null ? user.getPhone() : "",
                user.getStatus()
        );

        return ResponseEntity.ok(response);
    }
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UserDTO userDTO,
                                           HttpServletRequest request) {

        LoginResponse jwtUser = JWTUtil.getUser(request);

        UserDTO currentUser = userService.getUserByEmail(jwtUser.getEmail()).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            UserDTO updatedUser = userService.updateProfile(currentUser.getId(), userDTO);

            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            ProfileResponse response = new ProfileResponse(
                    updatedUser.getEmail(),
                    updatedUser.getFullName(),
                    updatedUser.getPhone() != null ? updatedUser.getPhone() : "",
                    updatedUser.getStatus()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}