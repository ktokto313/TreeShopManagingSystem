/*
 * Author: Hung Dao
 * Created Date: 2026-06-07
 * Name: OtpRequest.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-15
 */
package swp391.group6.dto;

public class OtpRequest {
    private String email;
    private String otp;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}