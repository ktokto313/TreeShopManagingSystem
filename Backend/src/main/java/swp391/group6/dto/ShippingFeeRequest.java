package swp391.group6.dto;

import java.math.BigDecimal;

public class ShippingFeeRequest {
    private String province;
    private String district;
    private BigDecimal totalOrderValue;
    private int itemCount;

    public ShippingFeeRequest() {
    }

    public ShippingFeeRequest(String province, String district) {
        this.province = province;
        this.district = district;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public BigDecimal getTotalOrderValue() {
        return totalOrderValue;
    }

    public void setTotalOrderValue(BigDecimal totalOrderValue) {
        this.totalOrderValue = totalOrderValue;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    @Override
    public String toString() {
        return "ShippingFeeRequest{province='" + province + "', district='" + district + "', totalOrderValue=" + totalOrderValue + ", itemCount=" + itemCount + "}";
    }
}