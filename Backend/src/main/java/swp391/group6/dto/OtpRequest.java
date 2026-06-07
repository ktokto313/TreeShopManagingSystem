//6/7: Hung Dao: Otp request dto
package swp391.group6.dto;

public class OtpRequest {
    private String email;
    private String otp;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}