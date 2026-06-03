package swp391.group6.dto;

public class ProfileResponse {
    private String email;
    private String fullName;
    private String phone;
    private boolean status;

    public ProfileResponse(String email, String fullName, String phone, boolean status) {
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.status = status;
    }

    public String getEmail() {return email; }

    public String getFullName() {return fullName; }

    public String getPhone() {return phone; }

    public boolean isActive() { return status; }
}
