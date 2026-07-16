/*
 * Author: Hung Dao
 * Created Date: 2026-06-10
 * Name: ChangePasswordRequest.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
 */
package swp391.group6.dto;

public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
