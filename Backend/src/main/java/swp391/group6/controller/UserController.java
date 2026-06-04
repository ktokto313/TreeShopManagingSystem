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

    //get all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null || !"SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable long id, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = currentUser.getRole();
        if (!"SYSTEM_ADMIN".equalsIgnoreCase(role) && !(currentUser.getId() == id) &&
            !"MANAGER".equalsIgnoreCase(role) && !"SHIPPER".equalsIgnoreCase(role) && !"SUPPORT_AGENT".equalsIgnoreCase(role)) {
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

        return userService.getUserById(currentUser.getId())
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

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable long id,
                                               @RequestBody UserDTO userDTO,
                                               HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String role = currentUser.getRole();
        if (!"SYSTEM_ADMIN".equalsIgnoreCase(role) && !(currentUser.getId() == id) &&
            !"MANAGER".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMyProfile(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserDTO updatedUser = userService.updateUser(currentUser.getId(), userDTO);
            if (updatedUser == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

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

        UserDTO unbannedUser = userService.unbanUser(id);
        if (unbannedUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(unbannedUser);
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
        if (!"SYSTEM_ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role) && !"SUPPORT_AGENT".equalsIgnoreCase(role)) {
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

        List<UserDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    private boolean isSystemAdmin(HttpServletRequest request) {
        LoginResponse currentUser = JWTUtil.getUser(request);
        return currentUser != null && "SYSTEM_ADMIN".equalsIgnoreCase(currentUser.getRole());
    }
}
