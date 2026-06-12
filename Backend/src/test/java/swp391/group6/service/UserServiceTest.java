package swp391.group6.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import swp391.group6.dto.UserDTO;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, roleRepository);
    }

    @Test
    void createUserRejectsInvalidEmailAndBlankPassword() {
        UserDTO invalidEmail = new UserDTO();
        invalidEmail.setEmail("not-an-email");
        invalidEmail.setPassword("password");

        UserDTO blankPassword = new UserDTO();
        blankPassword.setEmail("user@example.com");
        blankPassword.setPassword(" ");

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(invalidEmail));
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(blankPassword));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateOwnProfileCannotChangeEmailRoleOrStatus() {
        Role customerRole = new Role();
        customerRole.setName("CUSTOMER");

        User user = new User();
        user.setId(7L);
        user.setEmail("customer@example.com");
        user.setPassword("existing-hash");
        user.setFullName("Old Name");
        user.setPhone("0900000000");
        user.setRole(customerRole);
        user.setStatus(true);

        UserDTO request = new UserDTO();
        request.setEmail("attacker@example.com");
        request.setFullName("New Name");
        request.setPhone("0911111111");
        request.setRoleName("MANAGER");
        request.setStatus(false);

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        UserDTO result = userService.updateOwnProfile(7L, request);

        assertEquals("customer@example.com", result.getEmail());
        assertEquals("CUSTOMER", result.getRoleName());
        assertEquals(true, result.getStatus());
        assertEquals("New Name", result.getFullName());
        assertEquals("0911111111", result.getPhone());
    }
}
