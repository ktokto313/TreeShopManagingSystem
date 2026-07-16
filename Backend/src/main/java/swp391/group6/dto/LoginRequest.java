/*
 * Author: Hung Dao
 * Created Date: 2026-05-29
 * Name: LoginRequest.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-15
 */
package swp391.group6.dto;

public class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
