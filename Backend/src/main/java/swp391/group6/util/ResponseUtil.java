package swp391.group6.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

public class ResponseUtil {
    private ResponseUtil() {}

    public static void writeErrorResponse(
            HttpServletResponse response,
            HttpStatus status
    ) {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
    }
}
