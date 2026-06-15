/*
 * Name: User REST Controller
 * @Author: DucLM
 * Date: 2026-06-05
 * Version: 2.0
 * Description: Exposes /api/users CRUD, search, ban/unban, and profile endpoints with JWT role-based access control.
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // SYSTEM_ADMIN only
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(HttpServletRequest request, @RequestParam(required = false) String role) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if ("SHIPPER".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<UserDTO> users;
        if (role != null && !role.isBlank()) {
            users = userService.searchUsersByRole(role);
        } else {
            users = userService.getAllUsers();
        }
        return ResponseEntity.ok(users);
    }

    // Get by id (role-based)
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable long id, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = currentUser.getRole();

        if (!"SYSTEM_ADMIN".equalsIgnoreCase(role)
                && !"MANAGER".equalsIgnoreCase(role)
                && !"SUPPORT_AGENT".equalsIgnoreCase(role)
                && !"SHIPPER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMyProfile(HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Allow users to view their own profile regardless of role protection
        return userService.getUserByEmailUnprotected(currentUser.getEmail())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // SYSTEM_ADMIN / MANAGER
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable long id,
                                              @RequestBody UserDTO userDTO,
                                              HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = currentUser.getRole();

        boolean isOwnProfile = userService.getUserByEmailUnprotected(currentUser.getEmail())
                .map(u -> u.getId() == id)
                .orElse(false);

        boolean canManageUsers = "SYSTEM_ADMIN".equalsIgnoreCase(role)
                || "MANAGER".equalsIgnoreCase(role);
        if (!isOwnProfile && !canManageUsers) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            UserDTO updatedUser = isOwnProfile
                    ? userService.updateOwnProfile(id, userDTO)
                    : userService.updateUser(id, userDTO);
            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(@RequestBody UserDTO userDTO,
                                                   HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserDTO updatedUser = userService.getUserByEmailUnprotected(currentUser.getEmail())
                    .map(u -> userService.updateOwnProfile(u.getId(), userDTO))
                    .orElse(null);

            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // SYSTEM_ADMIN only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable long id, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean deleted = userService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ban")
    public ResponseEntity<UserDTO> banUser(@PathVariable long id, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDTO bannedUser = userService.banUser(id);
        if (bannedUser == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bannedUser);
    }

    @PatchMapping("/{id}/unban")
    public ResponseEntity<UserDTO> unbanUser(@PathVariable long id, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserDTO user = userService.unbanUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam(required = false) String query,
                                         @RequestParam(required = false) String email,
                                         HttpServletRequest request) {

        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = currentUser.getRole();

        if (!"SYSTEM_ADMIN".equalsIgnoreCase(role)
                && !"MANAGER".equalsIgnoreCase(role)
                && !"SUPPORT_AGENT".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (email != null && !email.isBlank()) {
            Optional<UserDTO> user = userService.getUserByEmail(email);
            return user.<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
