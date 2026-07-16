package swp391.group6.service.viettelpost;

public class PriceOption {
    private String MA_DV_CHINH;
    private String TEN_DICHVU;
    private int GIA_CUOC;
    private String THOI_GIAN;
    private int EXCHANGE_WEIGHT;

    public String getMA_DV_CHINH() {
        return MA_DV_CHINH;
    }

    public void setMA_DV_CHINH(String MA_DV_CHINH) {
        this.MA_DV_CHINH = MA_DV_CHINH;
    }

    public String getTEN_DICHVU() {
        return TEN_DICHVU;
    }

    public void setTEN_DICHVU(String TEN_DICHVU) {
        this.TEN_DICHVU = TEN_DICHVU;
    }

    public int getGIA_CUOC() {
        return GIA_CUOC;
    }

    public void setGIA_CUOC(int GIA_CUOC) {
        this.GIA_CUOC = GIA_CUOC;
    }

    public String getTHOI_GIAN() {
        return THOI_GIAN;
    }

    public void setTHOI_GIAN(String THOI_GIAN) {
        this.THOI_GIAN = THOI_GIAN;
    }

    public int getEXCHANGE_WEIGHT() {
        return EXCHANGE_WEIGHT;
    }

    public void setEXCHANGE_WEIGHT(int EXCHANGE_WEIGHT) {
        this.EXCHANGE_WEIGHT = EXCHANGE_WEIGHT;
    }

    @Override
    public String toString() {
        return "PriceOption{service=" + TEN_DICHVU + ", price=" + GIA_CUOC + ", time=" + THOI_GIAN + "}";
    }
}
