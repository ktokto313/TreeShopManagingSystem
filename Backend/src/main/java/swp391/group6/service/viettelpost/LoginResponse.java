package swp391.group6.service.viettelpost;

public class LoginResponse {
    private int status;
    private String message;
    private String error;
    private TokenData data;

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

    public TokenData getData() {
        return data;
    }

    public void setData(TokenData data) {
        this.data = data;
    }

    public boolean isSuccess() {
        return status == 200 && data != null && data.getToken() != null && !data.getToken().isBlank();
    }

    public String getToken() {
        return data != null ? data.getToken() : null;
    }
}
