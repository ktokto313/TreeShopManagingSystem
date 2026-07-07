package swp391.group6.component;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import swp391.group6.dto.LoginResponse;
import swp391.group6.model.User;
import swp391.group6.repository.UserRepository;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;

import java.io.IOException;

@Order(1)
@Component
public class JWTFilter extends OncePerRequestFilter {
    private final UserRepository userRepository;

    @Value("${jwt.cookie.name}")
    private String cookieName;

    public JWTFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Cookie cookie = CookieUtil.getJWTCookie(request.getCookies());

        if (cookie != null) {
            try {
                DecodedJWT decodedJWT = JWTUtil.verify(cookie.getValue());
                LoginResponse tokenUser = JWTUtil.getUser(decodedJWT);
                if (tokenUser != null && tokenUser.getEmail() != null) {
                    User user = userRepository.findByEmail(tokenUser.getEmail())
                            .filter(User::isStatus)
                            .orElse(null);

                    if (user != null) {
                        String role = user.getRole() == null ? "CUSTOMER" : user.getRole().getName();
                        LoginResponse currentUser = new LoginResponse(
                                user.getId(),
                                user.getEmail(),
                                user.getFullName(),
                                role
                        );

                        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        request.setAttribute(cookieName, currentUser);
                    }
                }
            } catch (Exception e) {
                // Ignore exceptions and let Spring Security handle authorization downstream
            }
        }

        filterChain.doFilter(request, response);
    }
}
