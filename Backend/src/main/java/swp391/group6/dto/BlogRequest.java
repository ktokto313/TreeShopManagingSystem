package swp391.group6.dto;

import lombok.Data;
import swp391.group6.model.BlogTag;

import java.util.List;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private String thumbnail;
    private List<String> images;
    private String status;
    private List<BlogTag> tags;
}