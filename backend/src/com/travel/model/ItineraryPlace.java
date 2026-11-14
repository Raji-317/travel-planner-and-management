package com.travel.model;

public class ItineraryPlace {
    private int itineraryPlaceId;
    private int itineraryDayId;
    private int attractionId;
    private String attractionName;
    private String categoryName;
    private String imageUrl;
    private int visitOrder;
    private String timeSlot; // MORNING, AFTERNOON, EVENING
    private String visitStartTime; // e.g. "09:30 AM"
    private int allocatedDurationMin;
    private int travelTimeToNextMin;
    private double estimatedCost;
    private double activityCost;
    private double totalPlaceExpenditure;
    private String expenditureBreakdown;
    private String notes;

    public ItineraryPlace() {}

    public int getItineraryPlaceId() { return itineraryPlaceId; }
    public void setItineraryPlaceId(int itineraryPlaceId) { this.itineraryPlaceId = itineraryPlaceId; }

    public int getItineraryDayId() { return itineraryDayId; }
    public void setItineraryDayId(int itineraryDayId) { this.itineraryDayId = itineraryDayId; }

    public int getAttractionId() { return attractionId; }
    public void setAttractionId(int attractionId) { this.attractionId = attractionId; }

    public String getAttractionName() { return attractionName; }
    public void setAttractionName(String attractionName) { this.attractionName = attractionName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public int getVisitOrder() { return visitOrder; }
    public void setVisitOrder(int visitOrder) { this.visitOrder = visitOrder; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getVisitStartTime() { return visitStartTime; }
    public void setVisitStartTime(String visitStartTime) { this.visitStartTime = visitStartTime; }

    public int getAllocatedDurationMin() { return allocatedDurationMin; }
    public void setAllocatedDurationMin(int allocatedDurationMin) { this.allocatedDurationMin = allocatedDurationMin; }

    public int getTravelTimeToNextMin() { return travelTimeToNextMin; }
    public void setTravelTimeToNextMin(int travelTimeToNextMin) { this.travelTimeToNextMin = travelTimeToNextMin; }

    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }

    public double getActivityCost() { return activityCost; }
    public void setActivityCost(double activityCost) { this.activityCost = activityCost; }

    public double getTotalPlaceExpenditure() { return totalPlaceExpenditure; }
    public void setTotalPlaceExpenditure(double totalPlaceExpenditure) { this.totalPlaceExpenditure = totalPlaceExpenditure; }

    public String getExpenditureBreakdown() { return expenditureBreakdown; }
    public void setExpenditureBreakdown(String expenditureBreakdown) { this.expenditureBreakdown = expenditureBreakdown; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

