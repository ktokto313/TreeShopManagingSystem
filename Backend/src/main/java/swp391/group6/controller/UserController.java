/*
 * Author: DucLM
 * Created Date: 2026-05-29
 * Name: User REST Controller
 * Description: Exposes /api/users CRUD, search, ban/unban, and profile endpoints with @PreAuthorize role-based access control.
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-28
 */
package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.model.User;
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

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestParam(required = false) String role) {
        List<UserDTO> users;
        if (role != null && !role.isBlank()) {
            users = userService.searchUsersByRole(role);
        } else {
            users = userService.getAllUsers();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER', 'SUPPORT_AGENT', 'SHIPPER')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getMyProfile(@AuthenticationPrincipal User user) {
        return userService.getUserByEmailUnprotected(user.getEmail())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        try {
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id == #user.id or hasAnyRole('SYSTEM_ADMIN', 'MANAGER')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable long id,
                                              @RequestBody UserDTO userDTO,
                                              @AuthenticationPrincipal User user) {
        String role = user.getRole() == null ? "CUSTOMER" : user.getRole().getName();
        boolean isOwnProfile = user.getId() == id;
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> updateMyProfile(@RequestBody UserDTO userDTO,
                                                   @AuthenticationPrincipal User user) {
        UserDTO updatedUser;
        try {
            updatedUser = userService.getUserByEmailUnprotected(user.getEmail())
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable long id) {
        boolean deleted = userService.deleteUser(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/ban")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserDTO> banUser(@PathVariable long id) {
        UserDTO bannedUser = userService.banUser(id);
        if (bannedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(bannedUser);
    }

    @PatchMapping("/{id}/unban")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserDTO> unbanUser(@PathVariable long id) {
        UserDTO user = userService.unbanUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'MANAGER', 'SUPPORT_AGENT', 'SHIPPER')")
    public ResponseEntity<?> searchUsers(@RequestParam(required = false) String query,
                                         @RequestParam(required = false) String email) {
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
