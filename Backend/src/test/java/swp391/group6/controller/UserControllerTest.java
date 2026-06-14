package swp391.group6.controller;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.model.Role;
import swp391.group6.model.User;
import swp391.group6.repository.UserRepository;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;
import swp391.group6.util.JacksonUtil;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void ownIdUpdateUsesRestrictedProfileUpdate() throws Exception {
        // Generate valid token for customer
        String token = JWTUtil.createToken(
                new LoginResponse("customer@example.com", "Customer", "CUSTOMER")
        );

        // Mock database check in JWTFilter
        Role role = new Role();
        role.setName("CUSTOMER");
        User userEntity = new User();
        userEntity.setEmail("customer@example.com");
        userEntity.setRole(role);
        userEntity.setStatus(true);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(userEntity));

        // Mock UserController service dependencies
        UserDTO existingUser = new UserDTO();
        existingUser.setId(7L);
        existingUser.setEmail("customer@example.com");

        UserDTO updateRequest = new UserDTO();
        updateRequest.setFullName("New Customer Name");
        updateRequest.setRoleName("MANAGER");
        updateRequest.setStatus(false);

        UserDTO updatedUser = new UserDTO();
        updatedUser.setId(7L);
        updatedUser.setEmail("customer@example.com");
        updatedUser.setFullName("New Customer Name");
        updatedUser.setRoleName("CUSTOMER");
        updatedUser.setStatus(true);

        when(userService.getUserByEmailUnprotected("customer@example.com"))
                .thenReturn(Optional.of(existingUser));
        when(userService.updateOwnProfile(eq(7L), any(UserDTO.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/{id}", 7)
                        .cookie(new Cookie(JWTUtil.getCookieName(), token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JacksonUtil.parseObjectToJSONString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleName").value("CUSTOMER"))
                .andExpect(jsonPath("$.fullName").value("New Customer Name"));

        verify(userService).updateOwnProfile(eq(7L), any(UserDTO.class));
        verify(userService, never()).updateUser(anyLong(), any(UserDTO.class));
    }
}
