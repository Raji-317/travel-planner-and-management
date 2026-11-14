package com.travel.model;

public class TransitLeg {
    private String legType; // "OUTBOUND" or "RETURN"
    private String fromLocation;
    private String toLocation;
    private String transportMode; // TRAIN, BUS, CAB, CAR, AUTO, BIKE
    private String title;
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private double estimatedCost;
    private String routeDescription;
    private String tips;

    public TransitLeg() {}

    public TransitLeg(String legType, String fromLocation, String toLocation, String transportMode,
                      String title, String departureTime, String arrivalTime, String duration,
                      double estimatedCost, String routeDescription, String tips) {
        this.legType = legType;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transportMode = transportMode;
        this.title = title;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.duration = duration;
        this.estimatedCost = estimatedCost;
        this.routeDescription = routeDescription;
        this.tips = tips;
    }

    public String getLegType() { return legType; }
    public void setLegType(String legType) { this.legType = legType; }

    public String getFromLocation() { return fromLocation; }
    public void setFromLocation(String fromLocation) { this.fromLocation = fromLocation; }

    public String getToLocation() { return toLocation; }
    public void setToLocation(String toLocation) { this.toLocation = toLocation; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getRouteDescription() { return routeDescription; }
    public void setRouteDescription(String routeDescription) { this.routeDescription = routeDescription; }

    public String getTips() { return tips; }
    public void setTips(String tips) { this.tips = tips; }
}
