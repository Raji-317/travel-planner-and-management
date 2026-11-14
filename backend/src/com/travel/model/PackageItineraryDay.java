package com.travel.model;

public class PackageItineraryDay {
    private int itineraryDayId;
    private int packageId;
    private int dayNumber;
    private String title;
    private String description;
    private String morningActivity;
    private String afternoonActivity;
    private String eveningActivity;
    private String mealsIncluded;

    public PackageItineraryDay() {}

    public int getItineraryDayId() { return itineraryDayId; }
    public void setItineraryDayId(int itineraryDayId) { this.itineraryDayId = itineraryDayId; }

    public int getPackageId() { return packageId; }
    public void setPackageId(int packageId) { this.packageId = packageId; }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMorningActivity() { return morningActivity; }
    public void setMorningActivity(String morningActivity) { this.morningActivity = morningActivity; }

    public String getAfternoonActivity() { return afternoonActivity; }
    public void setAfternoonActivity(String afternoonActivity) { this.afternoonActivity = afternoonActivity; }

    public String getEveningActivity() { return eveningActivity; }
    public void setEveningActivity(String eveningActivity) { this.eveningActivity = eveningActivity; }

    public String getMealsIncluded() { return mealsIncluded; }
    public void setMealsIncluded(String mealsIncluded) { this.mealsIncluded = mealsIncluded; }
}

