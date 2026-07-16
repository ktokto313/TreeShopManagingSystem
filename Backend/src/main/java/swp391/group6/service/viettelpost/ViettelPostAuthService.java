package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class ViettelPostAuthService {
    private static final Logger log = LoggerFactory.getLogger(ViettelPostAuthService.class);

    private final ViettelPostProperties properties;
    private final RestTemplate restTemplate;

    private String cachedToken;
    private Instant tokenExpiry;
    private final ReentrantLock tokenLock = new ReentrantLock();

    public ViettelPostAuthService(ViettelPostProperties properties, RestTemplateBuilder restTemplateBuilder) {
        this.properties = properties;
        this.restTemplate = restTemplateBuilder.rootUri(properties.getBaseUrl()).build();
    }

    public String getValidToken() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            log.debug("Using cached token, expires at {}", tokenExpiry);
            return cachedToken;
        }

        tokenLock.lock();
        try {
            if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
                log.debug("Using cached token (double-check), expires at {}", tokenExpiry);
                return cachedToken;
            }

            log.info("Fetching new token from ViettelPost...");
            String token = authenticate();
            
            cachedToken = token;
            tokenExpiry = Instant.now().plusSeconds(properties.getTokenCacheMinutes() * 60L);
            log.info("Token acquired, cached until {}", tokenExpiry);
            
            return token;
        } finally {
            tokenLock.unlock();
        }
    }

    private String authenticate() {
        String username = properties.getUsername();
        String password = properties.getPassword();

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalStateException("ViettelPost credentials not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> loginBody = new LinkedMultiValueMap<>();
        loginBody.add("USERNAME", username);
        loginBody.add("PASSWORD", password);

        HttpEntity<MultiValueMap<String, String>> loginRequest = new HttpEntity<>(loginBody, headers);
        
        log.info("Step 1: Login with username={}", username);
        LoginResponse loginResp = restTemplate.postForObject("/v2/user/login", loginRequest, LoginResponse.class);
        
        if (loginResp == null || !loginResp.isSuccess()) {
            throw new IllegalStateException("ViettelPost login failed: " + (loginResp != null ? loginResp.getMessage() : "null response"));
        }
        
        String tempToken = loginResp.getData();
        log.info("Step 1 SUCCESS: tempToken={}", tempToken);

        MultiValueMap<String, String> connectBody = new LinkedMultiValueMap<>();
        connectBody.add("USERNAME", username);
        connectBody.add("PASSWORD", password);
        connectBody.add("TOKEN", tempToken);

        HttpEntity<MultiValueMap<String, String>> connectRequest = new HttpEntity<>(connectBody, headers);
        
        log.info("Step 2: OwnerConnect");
        LoginResponse connectResp = restTemplate.postForObject("/v2/user/ownerconnect", connectRequest, LoginResponse.class);
        
        if (connectResp == null || !connectResp.isSuccess()) {
            throw new IllegalStateException("ViettelPost ownerconnect failed: " + (connectResp != null ? connectResp.getMessage() : "null response"));
        }
        
        String finalToken = connectResp.getData();
        log.info("Step 2 SUCCESS: finalToken={}", finalToken);
        
        return finalToken;
    }

    public void clearTokenCache() {
        tokenLock.lock();
        try {
            cachedToken = null;
            tokenExpiry = null;
            log.info("Token cache cleared");
        } finally {
            tokenLock.unlock();
        }
    }
}
