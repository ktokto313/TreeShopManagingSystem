package swp391.group6.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO implements Serializable {
    private Long id; //does not work with primitive data for some reasons, might be related to the db datatype
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String roleName;
    private boolean status;
    private String createdAt;
}
