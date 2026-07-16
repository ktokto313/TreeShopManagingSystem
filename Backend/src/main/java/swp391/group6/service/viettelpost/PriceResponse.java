package swp391.group6.service.viettelpost;

import java.util.List;

public class PriceResponse {
    private int status;
    private String message;
    private String error;
    private List<PriceOption> data;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public List<PriceOption> getData() {
        return data;
    }

    public void setData(List<PriceOption> data) {
        this.data = data;
    }

    public boolean isSuccess() {
        return status == 200 && data != null && !data.isEmpty();
    }
}
