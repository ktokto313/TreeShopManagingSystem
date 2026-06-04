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

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !hasRole(user, PROTECTED_ROLE_NAME))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<UserDTO> getUserById(long id) {
        return userRepository.findById(id)
                .filter(user -> !hasRole(user, PROTECTED_ROLE_NAME))
                .map(this::convertToDTO);
    }

    public UserDTO createUser(UserDTO userDTO) {
        validateUserForCreate(userDTO);
        User user = convertToEntity(userDTO);
        user.setRole(resolveRole(userDTO.getRoleName()));
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    private Role resolveRole(String roleName) {
        String requestedRole = roleName == null || roleName.isBlank()
                ? DEFAULT_ROLE_NAME
                : roleName.trim();

        if (PROTECTED_ROLE_NAME.equalsIgnoreCase(requestedRole)) {
            throw new IllegalArgumentException("System admin role cannot be assigned");
        }

        return roleRepository.findByNameIgnoreCase(requestedRole)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));
    }

    private void validateUserForCreate(UserDTO userDTO) {
            if (userDTO == null) {
                throw new IllegalArgumentException("User data is required");
            }
            }

    public UserDTO updateUser(long id, UserDTO userDTO) {
        if (userDTO == null) throw new IllegalArgumentException("User data is required");

        User user = userRepository.findById(id).orElse(null);
        if (user == null || hasRole(user, PROTECTED_ROLE_NAME)) return null;

        if (userDTO.getPassword() != null && !userDTO.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        if (userDTO.getFullName() != null) user.setFullName(userDTO.getFullName());
        if (userDTO.getPhone() != null) user.setPhone(userDTO.getPhone());
        if (userDTO.getRoleName() != null && !userDTO.getRoleName().isBlank())
            user.setRole(resolveRole(userDTO.getRoleName()));
        if (userDTO.getStatus() != null) user.setStatus(userDTO.getStatus());

        return convertToDTO(userRepository.save(user));
    }
    
    public boolean deleteUser(long id) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent() && !hasRole(existingUser.get(), PROTECTED_ROLE_NAME)) {
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
                .filter(user -> !hasRole(user, PROTECTED_ROLE_NAME))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .filter(user -> !hasRole(user, PROTECTED_ROLE_NAME))
                .map(this::convertToDTO);
    }

    // Allow users to view their own profile regardless of role protection
    public Optional<UserDTO> getUserByEmailUnprotected(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
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
        user.setStatus(dto.getStatus() == null || dto.getStatus());
        user.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        return user;
    }

    private boolean hasRole(User user, String roleName) {
        return user.getRole() != null && roleName.equalsIgnoreCase(user.getRole().getName());
    }
}
