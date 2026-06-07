//6/7: Hung Dao: Add Google Authorization Service for Google SSO, update for an alter flow
package swp391.group6.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import swp391.group6.dto.CompleteProfileRequest;
import swp391.group6.dto.GoogleAuthResponse;
import swp391.group6.model.User;
import swp391.group6.repository.RoleRepository;
import swp391.group6.repository.UserRepository;
import swp391.group6.util.CookieUtil;
import swp391.group6.util.JWTUtil;
import swp391.group6.dto.LoginResponse;

import java.sql.Timestamp;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public GoogleAuthService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public Object handleGoogleLogin(String credential, HttpServletResponse response) {
        GoogleIdToken.Payload payload = verifyToken(credential);

        String email  = payload.getEmail();
        String name   = (String) payload.get("name");

        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent()) {
            User user = existing.get();
            if (user.getPassword() != null) {
                throw new RuntimeException("Invalid email.");
            }

            LoginResponse loginResponse = new LoginResponse(
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole() != null ? user.getRole().getName() : "CUSTOMER"
            );
            String jwt = JWTUtil.createToken(loginResponse);
            ResponseCookie cookie = CookieUtil.makeCookieFromJWT(jwt);
            response.addHeader("Set-Cookie", cookie.toString());
            return Map.of(
                    "newUser", false,
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "role", user.getRole() != null ? user.getRole().getName() : "CUSTOMER"
            );
        }

        // New user — ask frontend to collect name + phone
        GoogleAuthResponse googleAuthResponse = new GoogleAuthResponse(true,email,name);
        googleAuthResponse.setNewUser(true);
        googleAuthResponse.setEmail(email);
        googleAuthResponse.setFullName(name);
        return googleAuthResponse;
    }

    public void completeGoogleProfile(CompleteProfileRequest req, HttpServletResponse response) {
        User user = new User();
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPassword(null);
        user.setPhone(req.getPhoneNumber());
        user.setStatus(true);
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        var role = roleRepository.findByName("CUSTOMER").orElse(null);
        if (role != null) user.setRole(role);

        userRepository.save(user);

        LoginResponse loginResponse = new LoginResponse(
                user.getEmail(),
                user.getFullName(),
                "CUSTOMER"
        );
        String jwt = JWTUtil.createToken(loginResponse);
        ResponseCookie cookie = CookieUtil.makeCookieFromJWT(jwt);
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private GoogleIdToken.Payload verifyToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) throw new RuntimeException("Invalid Google token");
            return idToken.getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Google token verification failed", e);
        }
    }
}