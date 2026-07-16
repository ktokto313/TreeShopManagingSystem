/*
 * Created By: MinhLTHE200133
 * Created At: 2026-05-29
 * Last Modified: 2026-07-11
 */
/*
 * Author: ktokto313
 * Created Date: 2026-05-29
 * Name: ProductDetail.java
 * Description: 
 * Last Change Author: lmd100
 * Last Change Date: 2026-06-24
 */
package swp391.group6.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_details")
public class ProductDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column
    private String description;

    @Column
    private String content;

    @Column(name = "care_guide")
    private String careGuide;

    @Column(name = "sunlight_level")
    private String sunlightLevel;

    @Column(name = "water_freq")
    private String wateringFrequency;

    @Column
    private String difficulty;

    @Column(name = "feng_shui_element")
    private String fengShuiElement;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String images;

    @OneToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCareGuide() {
        return careGuide;
    }

    public void setCareGuide(String careGuide) {
        this.careGuide = careGuide;
    }

    public String getSunlightLevel() {
        return sunlightLevel;
    }

    public void setSunlightLevel(String sunlightLevel) {
        this.sunlightLevel = sunlightLevel;
    }

    public String getWateringFrequency() {
        return wateringFrequency;
    }

    public void setWateringFrequency(String wateringFrequency) {
        this.wateringFrequency = wateringFrequency;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getFengShuiElement() {
        return fengShuiElement;
    }

    public void setFengShuiElement(String fengShuiElement) {
        this.fengShuiElement = fengShuiElement;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
}
