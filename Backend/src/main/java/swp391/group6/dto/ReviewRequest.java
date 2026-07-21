/*
 * Author: AnhLV
 * Created Date: 2026-06-24
 * Name: ReviewRequest.java
 * Description: Data Transfer Object (DTO) for encapsulating review request data.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-06-25
 */
package swp391.group6.dto;

import swp391.group6.model.Product;
import swp391.group6.model.User;

public class ReviewRequest {
    private Long productId;
    private String comment;
    private int rating;

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }
}