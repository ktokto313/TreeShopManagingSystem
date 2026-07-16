package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ViettelPostService {
    private static final Logger log = LoggerFactory.getLogger(ViettelPostService.class);

    private final ViettelPostProperties properties;
    private final ViettelPostClient client;

    public ViettelPostService(ViettelPostProperties properties, ViettelPostClient client) {
        this.properties = properties;
        this.client = client;
    }

    public int calculateShippingFee(int receiverDistrictId, int weightGrams) {
        log.info("calculateShippingFee ENTRY districtId={} weight={}g enabled={}",
                receiverDistrictId, weightGrams, properties.isEnabled());

        if (!properties.isEnabled()) {
            log.warn("ViettelPost disabled, returning fallback fee: {}", properties.getFallbackFee());
            return properties.getFallbackFee();
        }

        if (weightGrams <= 0) {
            log.warn("Invalid weight {}g, using default 1000g", weightGrams);
            weightGrams = 1000;
        }

        try {
            int senderProvinceId = properties.getSenderProvinceId();
            int senderDistrictId = properties.getSenderDistrictId();

            log.info("Mapped IDs: senderProvince={} senderDistrict={} receiverDistrict={}",
                    senderProvinceId, senderDistrictId, receiverDistrictId);

            List<PriceOption> options = client.getShippingPrice(
                    senderProvinceId, senderDistrictId,
                    senderProvinceId, receiverDistrictId,
                    weightGrams, 100000, 0
            );

            if (options == null || options.isEmpty()) {
                log.warn("No shipping options returned, using fallback");
                return properties.getFallbackFee();
            }

            PriceOption cheapest = options.stream()
                    .min((a, b) -> Integer.compare(a.getGIA_CUOC(), b.getGIA_CUOC()))
                    .orElse(options.get(0));

            log.info("Selected cheapest: {} - {} vnd - {}",
                    cheapest.getTEN_DICHVU(), cheapest.getGIA_CUOC(), cheapest.getTHOI_GIAN());

            return cheapest.getGIA_CUOC();

        } catch (Exception e) {
            log.error("Error calculating shipping fee: {}", e.getMessage(), e);
            return properties.getFallbackFee();
        }
    }

    public int mapDistrictNameToId(String districtName) {
        if (districtName == null) {
            return 110; // Default Hoan Kiem
        }
        
        String normalized = normalizeText(districtName);
        
        Map<String, Integer> hanoiDistricts = new HashMap<>();
        hanoiDistricts.put("quan hoan kiem", 110);
        hanoiDistricts.put("hoan kiem", 110);
        hanoiDistricts.put("quan ba dinh", 111);
        hanoiDistricts.put("ba dinh", 111);
        hanoiDistricts.put("quan dong da", 112);
        hanoiDistricts.put("dong da", 112);
        hanoiDistricts.put("quan hai ba trung", 113);
        hanoiDistricts.put("hai ba trung", 113);
        hanoiDistricts.put("quan tay ho", 114);
        hanoiDistricts.put("tay ho", 114);
        hanoiDistricts.put("quan cau giay", 115);
        hanoiDistricts.put("cau giay", 115);
        hanoiDistricts.put("quan thanh xuan", 116);
        hanoiDistricts.put("thanh xuan", 116);
        hanoiDistricts.put("quan ha dong", 117);
        hanoiDistricts.put("ha dong", 117);
        hanoiDistricts.put("quan long bien", 118);
        hanoiDistricts.put("long bien", 118);
        hanoiDistricts.put("quan nam tu liem", 119);
        hanoiDistricts.put("nam tu liem", 119);
        hanoiDistricts.put("quan bac tu liem", 120);
        hanoiDistricts.put("bac tu liem", 120);
        hanoiDistricts.put("quan hoang mai", 121);
        hanoiDistricts.put("hoang mai", 121);
        hanoiDistricts.put("quan thanh tri", 122);
        hanoiDistricts.put("thanh tri", 122);
        hanoiDistricts.put("huyen soc son", 123);
        hanoiDistricts.put("soc son", 123);
        hanoiDistricts.put("huyen dong anh", 124);
        hanoiDistricts.put("dong anh", 124);
        hanoiDistricts.put("huyen gia lam", 125);
        hanoiDistricts.put("gia lam", 125);
        hanoiDistricts.put("huyen thanh oai", 126);
        hanoiDistricts.put("thanh oai", 126);
        hanoiDistricts.put("huyen thuong tin", 127);
        hanoiDistricts.put("thuong tin", 127);
        hanoiDistricts.put("huyen phu xuyen", 128);
        hanoiDistricts.put("phu xuyen", 128);
        hanoiDistricts.put("huyen chuong my", 129);
        hanoiDistricts.put("chuong my", 129);
        hanoiDistricts.put("huyen my duc", 130);
        hanoiDistricts.put("my duc", 130);
        hanoiDistricts.put("huyen quoc oai", 131);
        hanoiDistricts.put("quoc oai", 131);
        hanoiDistricts.put("huyen thach that", 132);
        hanoiDistricts.put("thach that", 132);
        hanoiDistricts.put("huyen dan phuong", 133);
        hanoiDistricts.put("dan phuong", 133);
        hanoiDistricts.put("huyen hoai duc", 134);
        hanoiDistricts.put("hoai duc", 134);
        hanoiDistricts.put("huyen son tay", 135);
        hanoiDistricts.put("son tay", 135);
        hanoiDistricts.put("huyen Ba Vi", 136);
        hanoiDistricts.put("ba vi", 136);
        hanoiDistricts.put("huyen phuc tho", 137);
        hanoiDistricts.put("phuc tho", 137);
        hanoiDistricts.put("huyen ME Tri", 138);
        hanoiDistricts.put("me tri", 138);

        for (Map.Entry<String, Integer> entry : hanoiDistricts.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                log.debug("Mapped district '{}' to ID {}", districtName, entry.getValue());
                return entry.getValue();
            }
        }

        log.warn("Unknown district '{}', defaulting to Hoan Kiem ID 110", districtName);
        return 110; // Default to Hoan Kiem
    }

    private String normalizeText(String text) {
        if (text == null) return "";
        return removeDiacritics(text.toLowerCase()
                .replace("quận", "quan ")
                .replace("huyện", "huyen")
                .replace("tp ", "")
                .replace("tỉnh", "")
                .replaceAll("\\s+", " ")
                .trim());
    }

    private String removeDiacritics(String text) {
        if (text == null) return "";
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }

    public int calculateFallbackFee(String districtName, BigDecimal totalOrderValue, int itemCount) {
        log.info("calculateFallbackFee district={} totalOrderValue={} itemCount={}", districtName, totalOrderValue, itemCount);

        if (totalOrderValue != null && totalOrderValue.compareTo(BigDecimal.valueOf(1_000_000)) >= 0) {
            log.info("Order value {} >= 1,000,000 -> freeship", totalOrderValue);
            return 0;
        }

        int baseFee = getDistanceFee(districtName);
        int itemSurcharge = (itemCount / 3) * 3000;
        int total = baseFee + itemSurcharge;

        log.info("Fallback fee: base={} + surcharge={} = {}", baseFee, itemSurcharge, total);
        return total;
    }

    private int getDistanceFee(String districtName) {
        if (districtName == null) return 50000;

        String normalized = normalizeText(districtName);

        // Inner: Ba Đinh, Đống Đa, Hai Bà Trưng
        if (normalized.contains("ba dinh") || normalized.contains("dong da") || normalized.contains("hai ba trung")) {
            return 25000;
        }

        // Mid: Tây Hồ, Cầu Giấy, Thanh Xuân, Hoàn Kiếm, Nam Từ Liêm, Bắc Từ Liêm
        if (normalized.contains("tay ho") || normalized.contains("cau giay") || normalized.contains("thanh xuan")
                || normalized.contains("hoan kiem") || normalized.contains("nam tu liem") || normalized.contains("bac tu liem")) {
            return 30000;
        }

        // Outer: Hà Đông, Long Biên, Thanh Trì, Gia Lâm, Đan Phượng, Hoài Đức
        if (normalized.contains("ha dong") || normalized.contains("long bien") || normalized.contains("thanh tri")
                || normalized.contains("gia lam") || normalized.contains("dan phuong") || normalized.contains("hoai duc")) {
            return 40000;
        }

        // Far: Sóc Sơn, Đông Anh, Thạch Thất, Quốc Oai, Phú Xuyên, Chương Mỹ, Mỹ Đức, Phúc Thọ, Ba Vì, Sơn Tây, ME Tri
        if (normalized.contains("soc son") || normalized.contains("dong anh") || normalized.contains("thach that")
                || normalized.contains("quoc oai") || normalized.contains("phu xuyen") || normalized.contains("chuong my")
                || normalized.contains("my duc") || normalized.contains("phuc tho") || normalized.contains("ba vi")
                || normalized.contains("son tay") || normalized.contains("me tri")) {
            return 50000;
        }

        log.warn("Unknown district '{}', defaulting to far zone (50,000)", districtName);
        return 50000;
    }
}
