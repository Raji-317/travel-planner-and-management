package com.travel.model;

import java.sql.Time;
import java.sql.Timestamp;

public class Attraction {
    private int attractionId;
    private int destinationId;
    private int categoryId;
    private String categoryName;
    private String name;
    private String description;
    private int estimatedDurationMin;
    private double ticketPrice;
    private String openingTime; // String formatted HH:mm:ss for JSON
    private String closingTime;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private double popularityRating;
    private boolean isWheelchairAccessible;
    private Timestamp createdAt;

    public Attraction() {}

    public int getAttractionId() { return attractionId; }
    public void setAttractionId(int attractionId) { this.attractionId = attractionId; }

    public int getDestinationId() { return destinationId; }
    public void setDestinationId(int destinationId) { this.destinationId = destinationId; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getEstimatedDurationMin() { return estimatedDurationMin; }
    public void setEstimatedDurationMin(int estimatedDurationMin) { this.estimatedDurationMin = estimatedDurationMin; }

    public double getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(double ticketPrice) { this.ticketPrice = ticketPrice; }

    public String getOpeningTime() { return openingTime; }
    public void setOpeningTime(String openingTime) { this.openingTime = openingTime; }

    public String getClosingTime() { return closingTime; }
    public void setClosingTime(String closingTime) { this.closingTime = closingTime; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getPopularityRating() { return popularityRating; }
    public void setPopularityRating(double popularityRating) { this.popularityRating = popularityRating; }

    public boolean isWheelchairAccessible() { return isWheelchairAccessible; }
    public void setWheelchairAccessible(boolean wheelchairAccessible) { isWheelchairAccessible = wheelchairAccessible; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}

