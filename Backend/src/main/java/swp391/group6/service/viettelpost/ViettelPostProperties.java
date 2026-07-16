package swp391.group6.service.viettelpost;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "viettelpost")
public class ViettelPostProperties {
    private boolean enabled = false;
    private String username = "";
    private String password = "";
    private String baseUrl = "https://partner2.viettelpost.vn";
    private int senderProvinceId = 10;
    private int senderDistrictId = 110;
    private int fallbackFee = 30000;
    private int tokenCacheMinutes = 60;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public int getSenderProvinceId() {
        return senderProvinceId;
    }

    public void setSenderProvinceId(int senderProvinceId) {
        this.senderProvinceId = senderProvinceId;
    }

    public int getSenderDistrictId() {
        return senderDistrictId;
    }

    public void setSenderDistrictId(int senderDistrictId) {
        this.senderDistrictId = senderDistrictId;
    }

    public int getFallbackFee() {
        return fallbackFee;
    }

    public void setFallbackFee(int fallbackFee) {
        this.fallbackFee = fallbackFee;
    }

    public int getTokenCacheMinutes() {
        return tokenCacheMinutes;
    }

    public void setTokenCacheMinutes(int tokenCacheMinutes) {
        this.tokenCacheMinutes = tokenCacheMinutes;
    }
}
