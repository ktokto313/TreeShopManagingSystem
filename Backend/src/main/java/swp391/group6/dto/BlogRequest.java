package swp391.group6.dto;

import lombok.Data;
import java.util.List;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private String thumbnail;
    private List<String> images;
    private String status;
}