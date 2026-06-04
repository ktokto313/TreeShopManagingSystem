package swp391.group6.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import swp391.group6.dto.UserDTO;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String DEFAULT_ROLE_NAME = "CUSTOMER";
    private static final String PROTECTED_ROLE_NAME = "SYSTEM_ADMIN";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    public UserDTO createUser(UserDTO userDTO) {
        validateUserForCreate(userDTO);
        User user = convertToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    private void validateUserForCreate(UserDTO userDTO) {
        if (userDTO == null) {
            throw new IllegalArgumentException("User data is required");
        }
        if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }

    public UserDTO updateUser(long id, UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (userDTO.getEmail() != null) user.setEmail(userDTO.getEmail());
            if (userDTO.getPassword() != null) user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            if (userDTO.getFullName() != null) user.setFullName(userDTO.getFullName());
            if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());

            // Cập nhật dùng isStatus() cho kiểu boolean nguyên thủy
            user.setStatus(userDTO.isStatus());

            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }
        return null;
    }

    public boolean deleteUser(long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public UserDTO banUser(long id) {
        return updateUserStatus(id, false);
    }

    public UserDTO unbanUser(long id) {
        return updateUserStatus(id, true);
    }

    private UserDTO updateUserStatus(long id, boolean status) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty() || hasRole(existingUser.get(), PROTECTED_ROLE_NAME)) {
            return null;
        }

        User user = existingUser.get();
        user.setStatus(status);
        return convertToDTO(userRepository.save(user));
    }

    public List<UserDTO> searchUsers(String query) {
        return userRepository.search(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setPassword(user.getPassword());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getName());
        }

        dto.setStatus(user.isStatus());

        if (user.getCreatedAt() != null) {
            dto.setCreatedAt(user.getCreatedAt().toString());
        }
        return dto;
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        if (dto.getId() != null) user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setStatus(dto.isStatus());
        user.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        String roleName = (dto.getRoleName() != null && !dto.getRoleName().isBlank()) ? dto.getRoleName() : DEFAULT_ROLE_NAME;
        Role role = roleRepository.findByName(roleName).orElse(null);
        if (role == null) {
            role = new Role();
            role.setId(1L);
        }
        user.setRole(role);

        return user;
    }

    private boolean hasRole(User user, String roleName) {
        return user.getRole() != null && roleName.equalsIgnoreCase(user.getRole().getName());
    }
}