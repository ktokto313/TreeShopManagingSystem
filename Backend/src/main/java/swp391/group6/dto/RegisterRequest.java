/*
 * Author: Hung Dao
 * Created Date: 2026-06-03
 * Name: RegisterRequest.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-15
 */
package swp391.group6.dto;

public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName(){ return fullName; }
    public void setFullName(String fullName){ this.fullName = fullName; }
}
