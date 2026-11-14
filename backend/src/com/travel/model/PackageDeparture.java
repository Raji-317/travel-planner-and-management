package com.travel.model;

import java.sql.Date;

public class PackageDeparture {
    private int departureId;
    private int packageId;
    private String startDate; // yyyy-MM-dd
    private String endDate;
    private int totalSlots;
    private int availableSlots;
    private String status; // OPEN, FULL, CANCELLED, COMPLETED

    public PackageDeparture() {}

    public int getDepartureId() { return departureId; }
    public void setDepartureId(int departureId) { this.departureId = departureId; }

    public int getPackageId() { return packageId; }
    public void setPackageId(int packageId) { this.packageId = packageId; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getTotalSlots() { return totalSlots; }
    public void setTotalSlots(int totalSlots) { this.totalSlots = totalSlots; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

