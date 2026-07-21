package swp391.group6.service.viettelpost;

public class PriceRequest {
    private int SENDER_PROVINCE;
    private int SENDER_DISTRICT;
    private int RECEIVER_PROVINCE;
    private int RECEIVER_DISTRICT;
    private int PRODUCT_WEIGHT;
    private int PRODUCT_PRICE;
    private int MONEY_COLLECTION;

    public PriceRequest() {}

    public PriceRequest(int senderProvinceId, int senderDistrictId, 
                       int receiverProvinceId, int receiverDistrictId,
                       int weightGrams, int declaredValue, int codAmount) {
        this.SENDER_PROVINCE = senderProvinceId;
        this.SENDER_DISTRICT = senderDistrictId;
        this.RECEIVER_PROVINCE = receiverProvinceId;
        this.RECEIVER_DISTRICT = receiverDistrictId;
        this.PRODUCT_WEIGHT = weightGrams;
        this.PRODUCT_PRICE = declaredValue;
        this.MONEY_COLLECTION = codAmount;
    }

    public int getSENDER_PROVINCE() {
        return SENDER_PROVINCE;
    }

    public void setSENDER_PROVINCE(int SENDER_PROVINCE) {
        this.SENDER_PROVINCE = SENDER_PROVINCE;
    }

    public int getSENDER_DISTRICT() {
        return SENDER_DISTRICT;
    }

    public void setSENDER_DISTRICT(int SENDER_DISTRICT) {
        this.SENDER_DISTRICT = SENDER_DISTRICT;
    }

    public int getRECEIVER_PROVINCE() {
        return RECEIVER_PROVINCE;
    }

    public void setRECEIVER_PROVINCE(int RECEIVER_PROVINCE) {
        this.RECEIVER_PROVINCE = RECEIVER_PROVINCE;
    }

    public int getRECEIVER_DISTRICT() {
        return RECEIVER_DISTRICT;
    }

    public void setRECEIVER_DISTRICT(int RECEIVER_DISTRICT) {
        this.RECEIVER_DISTRICT = RECEIVER_DISTRICT;
    }

    public int getPRODUCT_WEIGHT() {
        return PRODUCT_WEIGHT;
    }

    public void setPRODUCT_WEIGHT(int PRODUCT_WEIGHT) {
        this.PRODUCT_WEIGHT = PRODUCT_WEIGHT;
    }

    public int getPRODUCT_PRICE() {
        return PRODUCT_PRICE;
    }

    public void setPRODUCT_PRICE(int PRODUCT_PRICE) {
        this.PRODUCT_PRICE = PRODUCT_PRICE;
    }

    public int getMONEY_COLLECTION() {
        return MONEY_COLLECTION;
    }

    public void setMONEY_COLLECTION(int MONEY_COLLECTION) {
        this.MONEY_COLLECTION = MONEY_COLLECTION;
    }

    @Override
    public String toString() {
        return "PriceRequest{" +
                "SENDER_PROVINCE=" + SENDER_PROVINCE +
                ", SENDER_DISTRICT=" + SENDER_DISTRICT +
                ", RECEIVER_PROVINCE=" + RECEIVER_PROVINCE +
                ", RECEIVER_DISTRICT=" + RECEIVER_DISTRICT +
                ", PRODUCT_WEIGHT=" + PRODUCT_WEIGHT +
                ", PRODUCT_PRICE=" + PRODUCT_PRICE +
                ", MONEY_COLLECTION=" + MONEY_COLLECTION +
                '}';
    }
}
