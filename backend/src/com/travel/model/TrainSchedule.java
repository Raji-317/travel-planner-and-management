package com.travel.model;

public class TrainSchedule {
    private String trainNumber;
    private String trainName;
    private String departureStation;
    private String arrivalStation;
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private String classes;
    private double fareEstimated;
    private String runsOn;
    private String platform;
    private String reachesSummary;

    public TrainSchedule() {}

    public TrainSchedule(String trainNumber, String trainName, String departureStation, String arrivalStation,
                         String departureTime, String arrivalTime, String duration, String classes,
                         double fareEstimated, String runsOn, String platform) {
        this.trainNumber = trainNumber;
        this.trainName = trainName;
        this.departureStation = departureStation;
        this.arrivalStation = arrivalStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.duration = duration;
        this.classes = classes;
        this.fareEstimated = fareEstimated;
        this.runsOn = runsOn;
        this.platform = platform;
        this.reachesSummary = "Reaches " + arrivalStation + " at " + arrivalTime;
    }

    public String getTrainNumber() { return trainNumber; }
    public void setTrainNumber(String trainNumber) { this.trainNumber = trainNumber; }

    public String getTrainName() { return trainName; }
    public void setTrainName(String trainName) { this.trainName = trainName; }

    public String getDepartureStation() { return departureStation; }
    public void setDepartureStation(String departureStation) { this.departureStation = departureStation; }

    public String getArrivalStation() { return arrivalStation; }
    public void setArrivalStation(String arrivalStation) { this.arrivalStation = arrivalStation; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getClasses() { return classes; }
    public void setClasses(String classes) { this.classes = classes; }

    public double getFareEstimated() { return fareEstimated; }
    public void setFareEstimated(double fareEstimated) { this.fareEstimated = fareEstimated; }

    public String getRunsOn() { return runsOn; }
    public void setRunsOn(String runsOn) { this.runsOn = runsOn; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getReachesSummary() { return reachesSummary; }
    public void setReachesSummary(String reachesSummary) { this.reachesSummary = reachesSummary; }
}
