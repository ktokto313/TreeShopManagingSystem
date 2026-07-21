/*
 * Created By: MinhLTHE200133
 * Created At: 2026-05-30
 * Last Modified: 2026-06-12
 */

package swp391.group6.dto;

public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private long productCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }
}
