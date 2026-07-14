package swp391.group6.dto;

import java.util.List;

public class HomepageFeaturedResponse {
    private String title;
    private List<ProductResponse> products;

    public HomepageFeaturedResponse() {
    }

    public HomepageFeaturedResponse(String title, List<ProductResponse> products) {
        this.title = title;
        this.products = products;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<ProductResponse> getProducts() {
        return products;
    }

    public void setProducts(List<ProductResponse> products) {
        this.products = products;
    }
}
