/*
 * Author: Hung Dao
 * Created Date: 2026-06-07
 * Name: GoogleAuthResponse.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-15
 */
package swp391.group6.dto;

public class GoogleAuthResponse {
    private boolean newUser;
    private String email;
    private String fullName;

    public GoogleAuthResponse(boolean newUser, String email, String fullName) {
        this.newUser = newUser;
        this.email = email;
        this.fullName = fullName;
    }

    public boolean isNewUser() { return newUser; }
    public void setNewUser(boolean newUser) { this.newUser = newUser; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
