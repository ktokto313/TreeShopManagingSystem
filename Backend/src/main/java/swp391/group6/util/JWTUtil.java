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
    public static final String CURRENT_USER_ATTRIBUTE =
            JWTUtil.class.getName() + ".currentUser";

    //TODO: remove hardcode value when migrate to docker
    private static Algorithm algorithm = Algorithm.HMAC256("a-string-for-testing");
    private static String jwtIssuer = "a";
    private static long lifetime = 86400L;
    private static String cookieName = "hihi";

    private JWTUtil() {}

    static {
        // Allow override via environment for docker
        String secret = System.getenv("JWT_SECRET");
        if (secret != null && !secret.isBlank()) {
            algorithm = Algorithm.HMAC256(secret);
        }

        String issuer = System.getenv("JWT_ISSUER");
        if (issuer != null && !issuer.isBlank()) {
            jwtIssuer = issuer;
        }

        String lifetimeEnv = System.getenv("JWT_LIFETIME");
        if (lifetimeEnv != null) {
            try {
                lifetime = Long.parseLong(lifetimeEnv);
            } catch (Exception ignored) {}
        }

        String name = System.getenv("JWT_COOKIE_NAME");
        if (name != null && !name.isBlank()) {
            cookieName = name;
        }
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
        Object currentUser = request.getAttribute(CURRENT_USER_ATTRIBUTE);
        if (currentUser instanceof LoginResponse loginResponse) {
            return loginResponse;
        }

        Object jwtAttribute = request.getAttribute(cookieName);
        if (!(jwtAttribute instanceof DecodedJWT decodedJWT)) {
            return null;
        }

        return getUser(decodedJWT);
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
