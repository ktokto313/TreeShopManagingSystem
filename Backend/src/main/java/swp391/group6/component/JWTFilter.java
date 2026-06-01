package swp391.group6.component;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;
import swp391.group6.util.ResponseUtil;

import java.io.IOException;

@Component
@Order(1)
public class JWTFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Skip auth endpoints — no token required
        if (request.getRequestURI().startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        Cookie jwtCookie = CookieUtil.getJWTCookie(request.getCookies());
        if (jwtCookie == null) {
            ResponseUtil.writeErrorResponse(response, HttpStatus.UNAUTHORIZED);
            return;
        }

        try {
            DecodedJWT decodedJWT = JWTUtil.verify(jwtCookie.getValue());
            request.setAttribute(jwtCookie.getName(), decodedJWT);
        } catch (Exception e) {
            ResponseUtil.writeErrorResponse(response, HttpStatus.UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
