package swp391.group6.component;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;
import swp391.group6.util.ResponseUtil;

import java.io.IOException;

@Order(1)
@Component
public class JWTFilter extends OncePerRequestFilter {
    @Value("${jwt.cookie.name}")
    private String cookieName;

    @PostConstruct
    public void init() {
        // Allow environment to override property
        String envName = System.getenv("JWT_COOKIE_NAME");
        if (envName != null && !envName.isBlank()) {
            cookieName = envName;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        String method = request.getMethod();

        if (requestUri.startsWith("/product-images/")) {
            return true;
        }

        if (requestUri.startsWith("/api/auth")) {
            return true;
        }

        if ("GET".equalsIgnoreCase(method)) {
            return requestUri.equals("/api/categories")
                    || requestUri.startsWith("/api/categories/")
                    || requestUri.equals("/api/products")
                    || requestUri.startsWith("/api/products/");
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        Cookie cookie = CookieUtil.getJWTCookie(request.getCookies());
        if (cookie == null) {
            ResponseUtil.writeErrorResponse(response, HttpStatus.UNAUTHORIZED);
            return;
        }

        try {
            DecodedJWT decodedJWT = JWTUtil.verify(cookie.getValue());
            request.setAttribute(cookieName, decodedJWT);
        } catch (Exception e) {
            ResponseUtil.writeErrorResponse(response, HttpStatus.UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
