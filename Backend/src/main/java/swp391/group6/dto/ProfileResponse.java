package swp391.group6.dto;

public class ProfileResponse {
    private String email;
    private String fullName;
    private String phone;
    private boolean status;
    private boolean hasPassword;

    public ProfileResponse(String email, String fullName, String phone,
                           boolean status, boolean hasPassword) {
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.status = status;
        this.hasPassword = hasPassword;
    }

    public String getEmail()       { return email; }
    public String getFullName()    { return fullName; }
    public String getPhone()       { return phone; }
    public boolean isStatus()      { return status; }
    public boolean isHasPassword() { return hasPassword; }
}