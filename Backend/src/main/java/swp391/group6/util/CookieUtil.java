//6/7: Dao Hung: Fix cookie config to run well on http
//6/9: Dao Hung: Add delete cookie for better logic on log out
package swp391.group6.util;

import jakarta.servlet.http.Cookie;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public final class CookieUtil {
    //TODO: remove hardcode value when migrate to docker
    private static Long cookieMaxAge = 86400L;
    private static String cookieName = "hihi";
    private static boolean cookieSecure = true;

    private CookieUtil() {}

    // TODO enforce wihtout try when migrate to docker from environment when available (useful for docker / dev)
    static {
        try {
            String lifetime = System.getenv("JWT_LIFETIME");
            if (lifetime != null) cookieMaxAge = Long.parseLong(lifetime);
        } catch (Exception ignored) {}

        String envName = System.getenv("JWT_COOKIE_NAME");
        if (envName != null && !envName.isBlank()) cookieName = envName;

        String secure = System.getenv("JWT_COOKIE_SECURE");
        if (secure != null) cookieSecure = Boolean.parseBoolean(secure);
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