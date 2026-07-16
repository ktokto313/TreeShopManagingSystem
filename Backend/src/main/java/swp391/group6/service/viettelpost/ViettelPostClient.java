package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Component
public class ViettelPostClient {
    private static final Logger log = LoggerFactory.getLogger(ViettelPostClient.class);

    private final ViettelPostAuthService authService;
    private final ViettelPostProperties properties;
    private final RestTemplate restTemplate;

    public ViettelPostClient(ViettelPostAuthService authService, ViettelPostProperties properties, RestTemplate restTemplate) {
        this.authService = authService;
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    public List<PriceOption> getShippingPrice(int senderProvinceId, int senderDistrictId, 
                                             int receiverProvinceId, int receiverDistrictId,
                                             int weightGrams, int declaredValue, int codAmount) {
        String token;
        try {
            token = authService.getValidToken();
        } catch (Exception e) {
            log.error("Failed to get ViettelPost token, returning empty: {}", e.getMessage());
            return List.of();
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", token);

        PriceRequest request = new PriceRequest(
                senderProvinceId, senderDistrictId,
                receiverProvinceId, receiverDistrictId,
                weightGrams, declaredValue, codAmount
        );

        log.info("getShippingPrice request={}", request);

        try {
            HttpEntity<PriceRequest> entity = new HttpEntity<>(request, headers);
            
            PriceOption[] responseArray = restTemplate.postForObject("/v2/order/getPriceAll", entity, PriceOption[].class);
            
            log.info("getShippingPrice raw response class={} length={}", 
                    responseArray != null ? responseArray.getClass().getName() : "null",
                    responseArray != null ? responseArray.length : -1);

            if (responseArray == null || responseArray.length == 0) {
                log.warn("ViettelPost API returned empty array");
                return List.of();
            }

            List<PriceOption> options = Arrays.stream(responseArray)
                    .filter(Objects::nonNull)
                    .toList();

            if (options.isEmpty()) {
                log.warn("All PriceOption elements were null");
                return List.of();
            }

            log.info("getShippingPrice SUCCESS: found {} options", options.size());
            return options;
        } catch (Exception e) {
            log.error("getShippingPrice API call failed: type={} message={}", 
                    e.getClass().getSimpleName(), e.getMessage());
            return List.of();
        }
    }
}
