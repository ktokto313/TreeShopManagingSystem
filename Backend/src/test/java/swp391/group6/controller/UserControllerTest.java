package swp391.group6.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @Test
    void ownIdUpdateUsesRestrictedProfileUpdate() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(
                JWTUtil.CURRENT_USER_ATTRIBUTE,
                new LoginResponse("customer@example.com", "Customer", "CUSTOMER")
        );

        UserDTO existingUser = new UserDTO();
        existingUser.setId(7L);
        existingUser.setEmail("customer@example.com");

        UserDTO updateRequest = new UserDTO();
        updateRequest.setRoleName("MANAGER");
        updateRequest.setStatus(false);

        UserDTO updatedUser = new UserDTO();
        updatedUser.setId(7L);
        updatedUser.setRoleName("CUSTOMER");
        updatedUser.setStatus(true);

        when(userService.getUserByEmailUnprotected("customer@example.com"))
                .thenReturn(Optional.of(existingUser));
        when(userService.updateOwnProfile(7L, updateRequest)).thenReturn(updatedUser);

        ResponseEntity<UserDTO> response =
                userController.updateUser(7L, updateRequest, request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("CUSTOMER", response.getBody().getRoleName());
        verify(userService).updateOwnProfile(7L, updateRequest);
        verify(userService, never()).updateUser(7L, updateRequest);
    }
}
