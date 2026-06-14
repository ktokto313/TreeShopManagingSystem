package swp391.group6.component;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.UserRepository;
import swp391.group6.util.JWTUtil;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class JWTFilterTest {

    @Test
    void rejectsAnExistingTokenAfterUserIsBanned() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        FilterChain filterChain = mock(FilterChain.class);
        JWTFilter filter = filterWithCookieName(userRepository);
        String token = JWTUtil.createToken(
                new LoginResponse("user@example.com", "User", "CUSTOMER")
        );

        User bannedUser = user("user@example.com", "CUSTOMER", false);
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(bannedUser));

        MockHttpServletRequest request = requestWithToken(token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertNull(request.getAttribute(JWTUtil.getCookieName()));
        verifyNoInteractions(filterChain);
    }

    @Test
    void refreshesRoleFromDatabaseInsteadOfTrustingTokenClaim() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        JWTFilter filter = filterWithCookieName(userRepository);
        String token = JWTUtil.createToken(
                new LoginResponse("user@example.com", "User", "CUSTOMER")
        );

        User currentUser = user("user@example.com", "MANAGER", true);
        when(userRepository.findByEmail("user@example.com"))
                .thenReturn(Optional.of(currentUser));

        MockHttpServletRequest request = requestWithToken(token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<LoginResponse> authenticatedUser = new AtomicReference<>();
        FilterChain filterChain = (servletRequest, servletResponse) ->
                authenticatedUser.set(JWTUtil.getUser((MockHttpServletRequest) servletRequest));

        filter.doFilter(request, response, filterChain);

        assertEquals("MANAGER", authenticatedUser.get().getRole());
    }

    private JWTFilter filterWithCookieName(UserRepository userRepository) {
        JWTFilter filter = new JWTFilter(userRepository);
        ReflectionTestUtils.setField(filter, "cookieName", "hihi");
        return filter;
    }

    private MockHttpServletRequest requestWithToken(String token) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/users/me");
        request.setCookies(new Cookie("hihi", token));
        return request;
    }

    private User user(String email, String roleName, boolean active) {
        Role role = new Role();
        role.setName(roleName);

        User user = new User();
        user.setEmail(email);
        user.setFullName("User");
        user.setRole(role);
        user.setStatus(active);
        return user;
    }
}
