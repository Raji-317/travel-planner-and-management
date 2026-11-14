package com.travel.model;

public class BusSchedule {
    private String serviceNumber;
    private String operatorName;
    private String busType;
    private String boardingPoint;
    private String droppingPoint;
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private double farePerSeat;
    private int seatsAvailable;
    private String amenities;

    public BusSchedule() {}

    public BusSchedule(String serviceNumber, String operatorName, String busType,
                       String boardingPoint, String droppingPoint, String departureTime,
                       String arrivalTime, String duration, double farePerSeat,
                       int seatsAvailable, String amenities) {
        this.serviceNumber = serviceNumber;
        this.operatorName = operatorName;
        this.busType = busType;
        this.boardingPoint = boardingPoint;
        this.droppingPoint = droppingPoint;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.duration = duration;
        this.farePerSeat = farePerSeat;
        this.seatsAvailable = seatsAvailable;
        this.amenities = amenities;
    }

    public String getServiceNumber() { return serviceNumber; }
    public void setServiceNumber(String serviceNumber) { this.serviceNumber = serviceNumber; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }

    public String getBoardingPoint() { return boardingPoint; }
    public void setBoardingPoint(String boardingPoint) { this.boardingPoint = boardingPoint; }

    public String getDroppingPoint() { return droppingPoint; }
    public void setDroppingPoint(String droppingPoint) { this.droppingPoint = droppingPoint; }

    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }

    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public double getFarePerSeat() { return farePerSeat; }
    public void setFarePerSeat(double farePerSeat) { this.farePerSeat = farePerSeat; }

    public int getSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(int seatsAvailable) { this.seatsAvailable = seatsAvailable; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}
