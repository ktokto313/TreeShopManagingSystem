package swp391.group6.dto;

public class RecommendationRequest {
    private String spaceType;
    private String careDifficulty;
    private String fengShuiElement;
    private Double budget;

    public String getSpaceType() {
        return spaceType;
    }

    public void setSpaceType(String spaceType) {
        this.spaceType = spaceType;
    }

    public String getCareDifficulty() {
        return careDifficulty;
    }

    public void setCareDifficulty(String careDifficulty) {
        this.careDifficulty = careDifficulty;
    }

    public String getFengShuiElement() {
        return fengShuiElement;
    }

    public void setFengShuiElement(String fengShuiElement) {
        this.fengShuiElement = fengShuiElement;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }
}
