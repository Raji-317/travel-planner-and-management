package com.travel.model;

import java.sql.Timestamp;

public class WishlistItem {
    private int wishlistId;
    private int userId;
    private Integer packageId;
    private Integer destinationId;
    private Timestamp createdAt;

    // Joined Destination details
    private String destinationName;
    private String destinationState;
    private String destinationCountry;
    private String description;
    private String imageUrl;
    private Double dailyBudgetEstimated;
    private Double popularityScore;
    private Integer totalReviews;

    // Joined Package details
    private String packageTitle;
    private Double basePricePerPerson;
    private Integer durationDays;

    public WishlistItem() {}

    public int getWishlistId() { return wishlistId; }
    public void setWishlistId(int wishlistId) { this.wishlistId = wishlistId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public Integer getPackageId() { return packageId; }
    public void setPackageId(Integer packageId) { this.packageId = packageId; }

    public Integer getDestinationId() { return destinationId; }
    public void setDestinationId(Integer destinationId) { this.destinationId = destinationId; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public String getDestinationName() { return destinationName; }
    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }

    public String getDestinationState() { return destinationState; }
    public void setDestinationState(String destinationState) { this.destinationState = destinationState; }

    public String getDestinationCountry() { return destinationCountry; }
    public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getDailyBudgetEstimated() { return dailyBudgetEstimated; }
    public void setDailyBudgetEstimated(Double dailyBudgetEstimated) { this.dailyBudgetEstimated = dailyBudgetEstimated; }

    public Double getPopularityScore() { return popularityScore; }
    public void setPopularityScore(Double popularityScore) { this.popularityScore = popularityScore; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public String getPackageTitle() { return packageTitle; }
    public void setPackageTitle(String packageTitle) { this.packageTitle = packageTitle; }

    public Double getBasePricePerPerson() { return basePricePerPerson; }
    public void setBasePricePerPerson(Double basePricePerPerson) { this.basePricePerPerson = basePricePerPerson; }

    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
}
