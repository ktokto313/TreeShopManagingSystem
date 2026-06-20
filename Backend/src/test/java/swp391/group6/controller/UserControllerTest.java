package swp391.group6.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import swp391.group6.dto.LoginResponse;
import swp391.group6.dto.UserDTO;
import swp391.group6.service.UserService;
import swp391.group6.util.JWTUtil;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private HttpServletRequest request;

    @Test
    void ownIdUpdateUsesRestrictedProfileUpdate() {
        UserController controller = new UserController(userService);
        when(request.getAttribute(JWTUtil.getCookieName()))
                .thenReturn(new LoginResponse("customer@example.com", "Customer", "CUSTOMER"));

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

        ResponseEntity<UserDTO> response = controller.updateUser(7L, updateRequest, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("CUSTOMER", response.getBody().getRoleName());
        assertEquals("New Customer Name", response.getBody().getFullName());

        verify(userService).updateOwnProfile(eq(7L), any(UserDTO.class));
        verify(userService, never()).updateUser(anyLong(), any(UserDTO.class));
    }
}
