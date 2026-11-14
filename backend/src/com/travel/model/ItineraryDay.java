package com.travel.model;

import java.util.ArrayList;
import java.util.List;

public class ItineraryDay {
    private int itineraryDayId;
    private int itineraryId;
    private int dayNumber;
    private String dayDate;
    private double estimatedDayCost;
    private double dayTicketsCost;
    private double dayTransportCost;
    private double dayFoodCost;
    private String trainArrivalNote;
    private int estimatedTravelTimeMin;

    private List<ItineraryPlace> places = new ArrayList<>();

    public ItineraryDay() {}

    public int getItineraryDayId() { return itineraryDayId; }
    public void setItineraryDayId(int itineraryDayId) { this.itineraryDayId = itineraryDayId; }

    public int getItineraryId() { return itineraryId; }
    public void setItineraryId(int itineraryId) { this.itineraryId = itineraryId; }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getDayDate() { return dayDate; }
    public void setDayDate(String dayDate) { this.dayDate = dayDate; }

    public double getEstimatedDayCost() { return estimatedDayCost; }
    public void setEstimatedDayCost(double estimatedDayCost) { this.estimatedDayCost = estimatedDayCost; }

    public double getDayTicketsCost() { return dayTicketsCost; }
    public void setDayTicketsCost(double dayTicketsCost) { this.dayTicketsCost = dayTicketsCost; }

    public double getDayTransportCost() { return dayTransportCost; }
    public void setDayTransportCost(double dayTransportCost) { this.dayTransportCost = dayTransportCost; }

    public double getDayFoodCost() { return dayFoodCost; }
    public void setDayFoodCost(double dayFoodCost) { this.dayFoodCost = dayFoodCost; }

    public String getTrainArrivalNote() { return trainArrivalNote; }
    public void setTrainArrivalNote(String trainArrivalNote) { this.trainArrivalNote = trainArrivalNote; }

    public int getEstimatedTravelTimeMin() { return estimatedTravelTimeMin; }
    public void setEstimatedTravelTimeMin(int estimatedTravelTimeMin) { this.estimatedTravelTimeMin = estimatedTravelTimeMin; }

    public List<ItineraryPlace> getPlaces() { return places; }
    public void setPlaces(List<ItineraryPlace> places) { this.places = places; }
}

