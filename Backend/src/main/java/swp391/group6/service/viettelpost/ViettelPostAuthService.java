package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.restclient.RestTemplateBuilder;
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
        headers.setContentType(MediaType.APPLICATION_JSON);

        String loginJson = String.format("{\"USERNAME\":\"%s\",\"PASSWORD\":\"%s\"}", username, password);
        HttpEntity<String> loginRequest = new HttpEntity<>(loginJson, headers);

        log.info("Step 1: Login with username={}", username);
        LoginResponse loginResp = restTemplate.postForObject("/v2/user/login", loginRequest, LoginResponse.class);
        log.info("Step 1 raw response: status={} message={} error={} data={}", loginResp.getStatus(), loginResp.getMessage(), loginResp.getError(), loginResp.getData());
        
        if (loginResp == null || !loginResp.isSuccess()) {
            throw new IllegalStateException("ViettelPost login failed: " + (loginResp != null ? loginResp.getMessage() : "null response"));
        }
        
        String tempToken = loginResp.getToken();
        log.info("Step 1 SUCCESS: tempToken={}", tempToken);

        HttpHeaders connectHeaders = new HttpHeaders();
        connectHeaders.setContentType(MediaType.APPLICATION_JSON);
        connectHeaders.set("Token", tempToken);
        log.info("Step 2 headers before request: {}", connectHeaders);
        log.info("Step 2 headers Token: {}", connectHeaders.getFirst("Token"));

        String connectJson = String.format("{\"USERNAME\":\"%s\",\"PASSWORD\":\"%s\"}", username, password);
        HttpEntity<String> connectRequest = new HttpEntity<>(connectJson, connectHeaders);
        
        log.info("Step 2: OwnerConnect");
        LoginResponse connectResp = restTemplate.postForObject("/v2/user/ownerconnect", connectRequest, LoginResponse.class);
        log.info("Step 2 raw response: status={} message={} error={} data={}", connectResp.getStatus(), connectResp.getMessage(), connectResp.getError(), connectResp.getData());
        
        if (connectResp == null || !connectResp.isSuccess()) {
            throw new IllegalStateException("ViettelPost ownerconnect failed: " + (connectResp != null ? connectResp.getMessage() : "null response"));
        }
        
        String finalToken = connectResp.getToken();
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
