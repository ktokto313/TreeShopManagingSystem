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
    //TODO: remove hardcode value when migrate to docker
    private static Algorithm algorithm = Algorithm.HMAC256("a-string-for-testing");
    private static String jwtIssuer = "a";
    private static long lifetime = 86400L;
    private static String cookieName = "hihi";

    private JWTUtil() {}

    static {
        //TODO uncomment when migrate to docker
//        cookieName = System.getenv("JWT_COOKIE_NAME");
//        jwtIssuer = System.getenv("JWT_ISSUER");
//        lifetime = Long.parseLong(System.getenv("JWT_LIFETIME"));
//        algorithm = Algorithm.HMAC256(System.getenv("JWT_SECRET"));
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
        DecodedJWT decodedJWT = (DecodedJWT) request.getAttribute(cookieName);
        try {
            Claim claim = decodedJWT.getClaim("user");

            return JacksonUtil.parseJSONToObject(claim.asString(), LoginResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
