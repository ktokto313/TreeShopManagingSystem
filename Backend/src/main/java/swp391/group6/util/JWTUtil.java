package swp391.group6.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import swp391.group6.dto.LoginResponse;

import java.time.Instant;

@Component
public class JWTUtil {

    private static Algorithm algorithm;
    private static String jwtIssuer;
    private static long lifetime;
    private static String cookieName;

    private JWTUtil() {}

    static {
        algorithm = Algorithm.HMAC256(System.getenv("JWT_SECRET"));
        jwtIssuer = System.getenv("JWT_ISSUER");
        lifetime = Long.parseLong(System.getenv("JWT_LIFETIME"));
        cookieName = System.getenv("JWT_COOKIE_NAME");
    }

    public static String getCookieName() {
        return cookieName;
    }

    public static String createToken(LoginResponse user) {
        return JWT.create()
            .withIssuer(jwtIssuer)
            .withIssuedAt(Instant.now())
            .withExpiresAt(Instant.now().plusSeconds(lifetime))
            .withClaim("user", JacksonUtil.parseObjectToJSONString(user))
            .sign(algorithm);
    }

    public static DecodedJWT verify(String jwt) {
        JWTVerifier jwtVerifier = JWT.require(algorithm)
                .withIssuer(jwtIssuer)
                .withClaimPresence("user")
                .build();
        return jwtVerifier.verify(jwt);
    }

    public static LoginResponse getUser(HttpServletRequest request) {
        Object currentUser = request.getAttribute(cookieName);
        if (currentUser instanceof LoginResponse loginResponse) {
            return loginResponse;
        }
        return null;
    }

    public static LoginResponse getUser(DecodedJWT decodedJWT) {
        try {
            Claim claim = decodedJWT.getClaim("user");

            return JacksonUtil.parseJSONToObject(claim.asString(), LoginResponse.class);
        } catch (Exception e) {
            return null;
        }
    }
}
