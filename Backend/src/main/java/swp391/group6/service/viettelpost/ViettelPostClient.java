package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class ViettelPostClient {
    private static final Logger log = LoggerFactory.getLogger(ViettelPostClient.class);

    private final ViettelPostAuthService authService;
    private final RestTemplate restTemplate;

    public ViettelPostClient(ViettelPostAuthService authService, RestTemplate restTemplate) {
        this.authService = authService;
        this.restTemplate = restTemplate;
    }

    public List<PriceOption> getShippingPrice(int senderProvinceId, int senderDistrictId, 
                                              int receiverProvinceId, int receiverDistrictId,
                                              int weightGrams, int declaredValue, int codAmount) {
        String token = authService.getValidToken();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Token", token);

        PriceRequest request = new PriceRequest(
                senderProvinceId, senderDistrictId,
                receiverProvinceId, receiverDistrictId,
                weightGrams, declaredValue, codAmount
        );

        log.info("getShippingPrice request={}", request);

        HttpEntity<PriceRequest> entity = new HttpEntity<>(request, headers);
        PriceResponse response = restTemplate.postForObject("/v2/order/getPriceAll", entity, PriceResponse.class);

        log.info("getShippingPrice response status={} error={} dataSize={}", 
                response != null ? response.getStatus() : "NULL",
                response != null ? response.getError() : "NULL",
                response != null && response.getData() != null ? response.getData().size() : 0);

        if (response == null || !response.isSuccess()) {
            throw new IllegalStateException("ViettelPost API error: " + 
                    (response != null ? response.getMessage() : "null response"));
        }

        if (response.getData() == null || response.getData().isEmpty()) {
            throw new IllegalStateException("ViettelPost API returned no shipping options");
        }

        log.info("getShippingPrice SUCCESS, found {} options", response.getData().size());
        return response.getData();
    }
}
