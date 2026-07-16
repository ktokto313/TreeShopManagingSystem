/*
 * Author: HungDLM
 * Created Date: 2026-07-15
 * Name: BlogTag.java
 * Description:
 * Last Change Author: HungDLM
 * Last Change Date: 2026-07-15
 */
package swp391.group6.model;

public enum BlogTag {
    CARE_TIPS("Mẹo chăm sóc"),
    DECOR_IDEAS("Ý tưởng trang trí"),
    PLANT_SPOTLIGHT("Giới thiệu cây"),
    BEGINNER_GUIDE("Hướng dẫn người mới"),
    DIY_PROJECT("Tự làm - DIY"),
    NEWS_EVENT("Tin tức - Sự kiện"),
    PEST_DISEASE("Sâu bệnh hại"),
    SEASONAL_GUIDE("Theo mùa");

    private final String displayName;

    BlogTag(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}