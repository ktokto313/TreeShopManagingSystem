package swp391.group6.service.viettelpost;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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

    public int calculateShippingFee(String province, String district, int weightGrams) {
        log.info("calculateShippingFee ENTRY province={} district={} weight={}g enabled={}",
                province, district, weightGrams, properties.isEnabled());

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
            int receiverProvinceId = mapProvinceNameToId(province);
            int receiverDistrictId = mapDistrictNameToId(district, receiverProvinceId);

            log.info("Mapped IDs: senderProvince={} senderDistrict={} receiverProvince={} receiverDistrict={}",
                    senderProvinceId, senderDistrictId, receiverProvinceId, receiverDistrictId);

            List<PriceOption> options = client.getShippingPrice(
                    senderProvinceId, senderDistrictId,
                    receiverProvinceId, receiverDistrictId,
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

    private int mapProvinceNameToId(String provinceName) {
        if (provinceName == null) {
            return 1;
        }
        String normalized = normalizeText(provinceName);
        
        Map<String, Integer> provinceMap = new HashMap<>();
        provinceMap.put("hanoi", 10);
        provinceMap.put("ha noi", 10);
        provinceMap.put("thanh pho ha noi", 10);
        provinceMap.put("ho chi minh", 1);
        provinceMap.put("hochiminh", 1);
        provinceMap.put("hcm", 1);
        provinceMap.put("tp hcm", 1);
        provinceMap.put("thanh pho ho chi minh", 1);
        provinceMap.put("da nang", 2);
        provinceMap.put("tp da nang", 2);
        provinceMap.put("hai phong", 3);
        provinceMap.put("can tho", 4);
        provinceMap.put("hue", 5);
        provinceMap.put("thanh hoa", 6);
        provinceMap.put("nghe an", 7);
        provinceMap.put("binh duong", 8);
        provinceMap.put("dong nai", 9);
        provinceMap.put("hai duong", 11);

        for (Map.Entry<String, Integer> entry : provinceMap.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                log.debug("Mapped province '{}' to ID {}", provinceName, entry.getValue());
                return entry.getValue();
            }
        }

        log.warn("Unknown province '{}', defaulting to ID 1", provinceName);
        return 1;
    }

    private int mapDistrictNameToId(String districtName, int provinceId) {
        if (districtName == null) {
            return 1;
        }
        String normalized = normalizeText(districtName);
        
        Map<String, Integer> hcmDistricts = new HashMap<>();
        hcmDistricts.put("quan 1", 1);
        hcmDistricts.put("quan 2", 2);
        hcmDistricts.put("quan 3", 3);
        hcmDistricts.put("quan 4", 4);
        hcmDistricts.put("quan 5", 5);
        hcmDistricts.put("quan 6", 6);
        hcmDistricts.put("quan 7", 7);
        hcmDistricts.put("quan 8", 8);
        hcmDistricts.put("quan 9", 9);
        hcmDistricts.put("quan 10", 10);
        hcmDistricts.put("quan 11", 11);
        hcmDistricts.put("quan 12", 12);
        hcmDistricts.put("binh thanh", 13);
        hcmDistricts.put("tan binh", 14);
        hcmDistricts.put("tan phu", 15);
        hcmDistricts.put("go vap", 16);
        hcmDistricts.put("phu nhuan", 17);
        hcmDistricts.put("thu duc", 18);
        hcmDistricts.put("binh chanh", 19);
        hcmDistricts.put("cu chi", 20);
        hcmDistricts.put("hoc mon", 21);
        hcmDistricts.put("nha be", 22);

        Map<String, Integer> hanoiDistricts = new HashMap<>();
        hanoiDistricts.put("quan hoan kiem", 110);
        hanoiDistricts.put("hoan kiem", 110);
        hanoiDistricts.put("quan ba dinh", 111);
        hanoiDistricts.put("ba dinh", 111);
        hanoiDistricts.put("quan dong da", 112);
        hanoiDistricts.put("dong da", 112);
        hanoiDistricts.put("quan hai ba trung", 113);
        hanoiDistricts.put("hai ba trung", 113);
        hanoiDistricts.put("quan badinh", 114);
        hanoiDistricts.put("quan cau giay", 115);
        hanoiDistricts.put("cau giay", 115);
        hanoiDistricts.put("quan long bien", 116);
        hanoiDistricts.put("long bien", 116);
        hanoiDistricts.put("quan tu liem", 117);
        hanoiDistricts.put("tu liem", 117);
        hanoiDistricts.put("quan thanh xuan", 118);
        hanoiDistricts.put("thanh xuan", 118);
        hanoiDistricts.put("quan ha dong", 119);
        hanoiDistricts.put("ha dong", 119);
        hanoiDistricts.put("quan son tay", 120);
        hanoiDistricts.put("son tay", 120);

        Map<String, Integer> districtMap;
        switch (provinceId) {
            case 1:
                districtMap = hcmDistricts;
                break;
            case 10:
                districtMap = hanoiDistricts;
                break;
            default:
                return 1;
        }

        for (Map.Entry<String, Integer> entry : districtMap.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                log.debug("Mapped district '{}' to ID {}", districtName, entry.getValue());
                return entry.getValue();
            }
        }

        log.warn("Unknown district '{}' in province {}, defaulting to ID 1", districtName, provinceId);
        return 1;
    }

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replace("quận", "quan ")
                .replace("tp ", "")
                .replace("tỉnh", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
