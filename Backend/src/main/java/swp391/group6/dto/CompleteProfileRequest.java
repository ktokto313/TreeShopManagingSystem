package swp391.group6.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CompleteProfileRequest {
    private String email;
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Invalid Vietnamese phone number")
    private String phoneNumber;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}