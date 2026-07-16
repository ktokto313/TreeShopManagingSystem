package swp391.group6.dto;

public class ShippingFeeRequest {
    private String province;
    private String district;

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

    @Override
    public String toString() {
        return "ShippingFeeRequest{province='" + province + "', district='" + district + "'}";
    }
}