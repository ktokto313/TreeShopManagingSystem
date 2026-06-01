package swp391.group6.util;

import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public final class CookieUtil {
    //TODO: remove hardcode value when migrate to docker
    private static Long cookieMaxAge = 86400L;
    private static String cookieName = "hihi";

    private CookieUtil() {}

    //TODO: uncomment when migrate to docker
//    static {
//        cookieMaxAge = Long.parseLong(System.getenv("JWT_LIFETIME"));
//        cookieName = System.getenv("JWT_COOKIE_NAME");
//    }

    public static ResponseCookie makeCookieFromJWT(String jwt) {
        return ResponseCookie.from(cookieName)
                .value(jwt)
                .httpOnly(true)
                .path("/")
                .secure(true)
                .sameSite("Strict")
                .maxAge(cookieMaxAge)
                .build();
    }

    public static ResponseCookie invalidateCookie() {
        return ResponseCookie.from(cookieName)
                .value("")
                .path("/")
                .secure(true)
                .httpOnly(true)
                .sameSite("Strict")
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
