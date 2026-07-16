package swp391.group6.service.viettelpost;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties(ViettelPostProperties.class)
public class ViettelPostConfig {

    private final ViettelPostProperties properties;

    public ViettelPostConfig(ViettelPostProperties properties) {
        this.properties = properties;
    }

    @Bean
    public RestTemplate viettelPostRestTemplate(RestTemplateBuilder builder) {
        return builder.rootUri(properties.getBaseUrl()).build();
    }
}
