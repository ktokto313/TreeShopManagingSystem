//6/7: Dao Hung: Fix cookie config to run well on http
//6/9: Dao Hung: Add delete cookie for better logic on log out
package swp391.group6.util;

import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public final class CookieUtil {
    private static Long cookieMaxAge;
    private static String cookieName;
    private static boolean cookieSecure;

    private CookieUtil() {}

    static {
        cookieMaxAge = Long.parseLong(System.getenv("JWT_LIFETIME"));
        cookieName = System.getenv("JWT_COOKIE_NAME");
        cookieSecure = Boolean.parseBoolean(System.getenv("JWT_COOKIE_SECURE"));
    }

    public static ResponseCookie makeCookieFromJWT(String jwt) {
        return ResponseCookie.from(cookieName)
                .value(jwt)
                .httpOnly(true)
                .path("/")
                .secure(cookieSecure)
                .sameSite("Strict")
                .maxAge(cookieMaxAge)
                .build();
    }

    public static ResponseCookie invalidateCookie() {
        return ResponseCookie.from(cookieName)
                .value("")
                .path("/")
                .secure(cookieSecure)
                .httpOnly(true)
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }

    public static Cookie getJWTCookie(Cookie[] cookies) {
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals(cookieName)) return cookie;
        }
        return null;
    }

}