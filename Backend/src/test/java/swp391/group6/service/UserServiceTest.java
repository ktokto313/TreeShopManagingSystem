package swp391.group6.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import swp391.group6.dto.UserDTO;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;

    private UserService userService;
    private Role customerRole, systemAdminRole, managerRole;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, roleRepository);
        customerRole    = role(1L, "CUSTOMER");
        systemAdminRole = role(2L, "SYSTEM_ADMIN");
        managerRole     = role(3L, "MANAGER");
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Role role(long id, String name) {
        Role r = new Role(); r.setId(id); r.setName(name); return r;
    }

    private User user(long id, String email, Role role, boolean status) {
        User u = new User();
        u.setId(id); u.setEmail(email); u.setRole(role); u.setStatus(status);
        return u;
    }

    private UserDTO dto(String email, String password, String roleName) {
        UserDTO d = new UserDTO();
        d.setEmail(email); d.setPassword(password); d.setRoleName(roleName);
        return d;
    }

    // ── 1. getAllUsers ─────────────────────────────────────────────────────────

    @Test
    void getAllUsers_FiltersOutSystemAdmin() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(
            user(1L, "customer@example.com", customerRole, true),
            user(2L, "admin@example.com",    systemAdminRole, true)
        ));

        List<UserDTO> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("CUSTOMER", result.get(0).getRoleName());
    }

    // ── 2. getUserById ────────────────────────────────────────────────────────

    @Test
    void getUserById_ReturnsEmptyIfNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertFalse(userService.getUserById(1L).isPresent());
    }

    @Test
    void getUserById_ReturnsEmptyIfSystemAdmin() {
        when(userRepository.findById(2L))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));
        assertFalse(userService.getUserById(2L).isPresent());
    }

    @Test
    void getUserById_ReturnsDTOIfNonAdmin() {
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(user(1L, "customer@example.com", customerRole, true)));

        Optional<UserDTO> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("customer@example.com", result.get().getEmail());
    }

    // ── 3. createUser — validation (ParameterizedTest) ────────────────────────

    static Stream<UserDTO> invalidCreateInputs() {
        UserDTO nullDto = null;

        UserDTO nullEmail = new UserDTO();
        nullEmail.setEmail(null);
        nullEmail.setPassword("password123");

        UserDTO invalidEmail = new UserDTO();
        invalidEmail.setEmail("not-an-email");
        invalidEmail.setPassword("password123");

        UserDTO nullPassword = new UserDTO();
        nullPassword.setEmail("customer@example.com");
        nullPassword.setPassword(null);

        UserDTO blankPassword = new UserDTO();
        blankPassword.setEmail("customer@example.com");
        blankPassword.setPassword("   ");

        return Stream.of(nullDto, nullEmail, invalidEmail, nullPassword, blankPassword);
    }

    @ParameterizedTest
    @MethodSource("invalidCreateInputs")
    void createUser_ThrowsOnInvalidInput(UserDTO dto) {
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(dto));
    }

    @Test
    void createUser_ThrowsIfEmailAlreadyInUse() {
        UserDTO dto = dto("customer@example.com", "password123", null);
        when(userRepository.findByEmail("customer@example.com"))
            .thenReturn(Optional.of(new User()));

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(dto));
    }

    // ── 4. createUser — resolveRole (ParameterizedTest) ───────────────────────

    static Stream<String> nullOrBlankRoleNames() {
        return Stream.of(null, "  ");
    }

    @ParameterizedTest
    @MethodSource("nullOrBlankRoleNames")
    void createUser_UsesDefaultRoleIfRoleNullOrBlank(String roleName) {
        UserDTO dto = dto("customer@example.com", "password123", roleName);
        User saved = user(10L, "customer@example.com", customerRole, true);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByNameIgnoreCase("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenReturn(saved);

        assertEquals("CUSTOMER", userService.createUser(dto).getRoleName());
    }

    @Test
    void createUser_ThrowsIfRoleIsSystemAdmin() {
        UserDTO dto = dto("customer@example.com", "password123", "SYSTEM_ADMIN");
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(dto));
    }

    @Test
    void createUser_ThrowsIfRoleNotFound() {
        UserDTO dto = dto("customer@example.com", "password123", "UNKNOWN");
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByNameIgnoreCase("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(dto));
    }

    @Test
    void createUser_SuccessHappyPath() {
        UserDTO dto = dto("m@example.com", "pass123", "MANAGER");
        dto.setFullName("John Doe"); dto.setPhone("0912345678"); dto.setStatus(true);

        User saved = user(15L, "m@example.com", managerRole, true);
        saved.setFullName("John Doe"); saved.setPhone("0912345678");
        saved.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        when(userRepository.findByEmail("m@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByNameIgnoreCase("MANAGER")).thenReturn(Optional.of(managerRole));
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDTO result = userService.createUser(dto);

        assertAll(
            () -> assertEquals(15L,          result.getId()),
            () -> assertEquals("m@example.com", result.getEmail()),
            () -> assertEquals("MANAGER",    result.getRoleName()),
            () -> assertEquals("John Doe",   result.getFullName()),
            () -> assertEquals("0912345678", result.getPhone()),
            () -> assertTrue(result.getStatus()),
            () -> assertNotNull(result.getCreatedAt())
        );
    }

    // ── 5. updateUser ─────────────────────────────────────────────────────────

    @Test
    void updateUser_ThrowsIfDtoNull() {
        assertThrows(IllegalArgumentException.class, () -> userService.updateUser(1L, null));
    }

    @Test
    void updateUser_ReturnsNullIfNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertNull(userService.updateUser(1L, new UserDTO()));
    }

    @Test
    void updateUser_ReturnsNullIfSystemAdmin() {
        when(userRepository.findById(2L))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));
        assertNull(userService.updateUser(2L, new UserDTO()));
    }

    @Test
    void updateUser_UpdatesAllFields() {
        User existing = user(5L, "user@example.com", customerRole, true);
        existing.setFullName("Old"); existing.setPhone("0900000000");

        UserDTO req = dto(null, "newPass", "MANAGER");
        req.setFullName("New"); req.setPhone("0911111111"); req.setStatus(false);

        User saved = user(5L, "user@example.com", managerRole, false);
        saved.setFullName("New"); saved.setPhone("0911111111");

        when(userRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(roleRepository.findByNameIgnoreCase("MANAGER")).thenReturn(Optional.of(managerRole));
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDTO result = userService.updateUser(5L, req);

        assertAll(
            () -> assertEquals("New",     result.getFullName()),
            () -> assertEquals("0911111111", result.getPhone()),
            () -> assertEquals("MANAGER", result.getRoleName()),
            () -> assertFalse(result.getStatus())
        );
    }

    @Test
    void updateUser_IgnoresNullOrBlankFields() {
        User existing = user(5L, "user@example.com", customerRole, true);
        existing.setFullName("Old"); existing.setPhone("0900000000");

        UserDTO req = new UserDTO();
        req.setPassword(" "); req.setFullName(null);
        req.setPhone(null);   req.setRoleName(" "); req.setStatus(null);

        when(userRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenReturn(existing);

        UserDTO result = userService.updateUser(5L, req);

        assertAll(
            () -> assertEquals("Old",        result.getFullName()),
            () -> assertEquals("0900000000", result.getPhone()),
            () -> assertEquals("CUSTOMER",   result.getRoleName()),
            () -> assertTrue(result.getStatus())
        );
    }

    // ── 6. updateOwnProfile ───────────────────────────────────────────────────

    @Test
    void updateOwnProfile_ThrowsIfDtoNull() {
        assertThrows(IllegalArgumentException.class, () -> userService.updateOwnProfile(1L, null));
    }

    @Test
    void updateOwnProfile_ReturnsNullIfNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertNull(userService.updateOwnProfile(1L, new UserDTO()));
    }

    @Test
    void updateOwnProfile_UpdatesFieldsAndSkipsBlankPassword() {
        User existing = user(7L, "user@example.com", customerRole, true);
        existing.setFullName("Old"); existing.setPhone("0900000000");

        UserDTO req = new UserDTO();
        req.setPassword(""); req.setFullName("New"); req.setPhone("0922222222");

        when(userRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenReturn(existing);

        UserDTO result = userService.updateOwnProfile(7L, req);

        assertAll(
            () -> assertEquals("New",        result.getFullName()),
            () -> assertEquals("0922222222", result.getPhone())
        );
    }

    // ── 7. deleteUser ─────────────────────────────────────────────────────────

    @Test
    void deleteUser_ReturnsFalseIfNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertFalse(userService.deleteUser(1L));
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteUser_ReturnsFalseIfSystemAdmin() {
        when(userRepository.findById(2L))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));
        assertFalse(userService.deleteUser(2L));
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteUser_ReturnsTrueAndDeletes() {
        when(userRepository.findById(5L))
            .thenReturn(Optional.of(user(5L, "user@example.com", customerRole, true)));
        assertTrue(userService.deleteUser(5L));
        verify(userRepository).deleteById(5L);
    }

    // ── 8. banUser / unbanUser ────────────────────────────────────────────────

    @Test
    void updateUserStatus_ReturnsNullIfNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertNull(userService.banUser(1L));
    }

    @Test
    void updateUserStatus_ReturnsNullIfSystemAdmin() {
        when(userRepository.findById(2L))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));
        assertNull(userService.banUser(2L));
    }

    @Test
    void banUser_SetsStatusFalse() {
        User u = user(5L, "user@example.com", customerRole, true);
        User banned = user(5L, "user@example.com", customerRole, false);
        when(userRepository.findById(5L)).thenReturn(Optional.of(u));
        when(userRepository.save(any(User.class))).thenReturn(banned);

        assertFalse(userService.banUser(5L).getStatus());
    }

    @Test
    void unbanUser_SetsStatusTrue() {
        User u = user(5L, "user@example.com", customerRole, false);
        User unbanned = user(5L, "user@example.com", customerRole, true);
        when(userRepository.findById(5L)).thenReturn(Optional.of(u));
        when(userRepository.save(any(User.class))).thenReturn(unbanned);

        assertTrue(userService.unbanUser(5L).getStatus());
    }

    // ── 9. searchUsers / getUserByEmail / getUserByEmailUnprotected ────────────

    @Test
    void searchUsers_FiltersOutSystemAdmin() {
        when(userRepository.search("test")).thenReturn(Arrays.asList(
            user(1L, "c@example.com", customerRole, true),
            user(2L, "a@example.com", systemAdminRole, true)
        ));
        assertEquals(1, userService.searchUsers("test").size());
    }

    @Test
    void getUserByEmail_ReturnsEmptyIfSystemAdmin() {
        when(userRepository.findByEmail("admin@example.com"))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));
        assertFalse(userService.getUserByEmail("admin@example.com").isPresent());
    }

    @Test
    void getUserByEmail_ReturnsDTOIfNonAdmin() {
        when(userRepository.findByEmail("c@example.com"))
            .thenReturn(Optional.of(user(1L, "c@example.com", customerRole, true)));

        Optional<UserDTO> result = userService.getUserByEmail("c@example.com");
        assertTrue(result.isPresent());
        assertEquals("c@example.com", result.get().getEmail());
    }

    @Test
    void getUserByEmailUnprotected_IncludesSystemAdmin() {
        when(userRepository.findByEmail("admin@example.com"))
            .thenReturn(Optional.of(user(2L, "admin@example.com", systemAdminRole, true)));

        Optional<UserDTO> result = userService.getUserByEmailUnprotected("admin@example.com");
        assertTrue(result.isPresent());
        assertEquals("SYSTEM_ADMIN", result.get().getRoleName());
    }

    // ── 10. convertToDTO / convertToEntity edge cases ─────────────────────────

    @Test
    void convertToDTO_HandlesNullRoleAndNullCreatedAt() {
        User u = new User();
        u.setId(100L); u.setEmail("user@example.com");
        u.setRole(null); u.setCreatedAt(null);

        when(userRepository.findById(100L)).thenReturn(Optional.of(u));

        Optional<UserDTO> result = userService.getUserById(100L);
        assertTrue(result.isPresent());
        assertNull(result.get().getRoleName());
        assertNull(result.get().getCreatedAt());
    }

    @Test
    void convertToEntity_NullIdSkippedAndNullStatusDefaultsTrue() {
        UserDTO dto = new UserDTO();
        dto.setId(null); dto.setEmail("customer@example.com");
        dto.setPassword("password"); dto.setStatus(null);

        User saved = user(99L, "customer@example.com", customerRole, true);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByNameIgnoreCase("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDTO result = userService.createUser(dto);
        assertEquals(99L, result.getId());
        assertTrue(result.getStatus());
    }
}