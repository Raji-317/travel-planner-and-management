package com.travel.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Package {
    private int packageId;
    private int operatorId;
    private String operatorName;
    private int destinationId;
    private String destinationName;
    private String title;
    private String slug;
    private String description;
    private int durationDays;
    private int durationNights;
    private double basePricePerPerson;
    private int maxTravellers;
    private String includedServices;
    private String excludedServices;
    private String accommodationDetails;
    private String transportationDetails;
    private String imageUrl;
    private double rating;
    private int totalBookings;
    private boolean isActive;
    private Timestamp createdAt;

    private List<PackageItineraryDay> itineraryDays = new ArrayList<>();
    private List<PackageDeparture> departures = new ArrayList<>();

    public Package() {}

    public int getPackageId() { return packageId; }
    public void setPackageId(int packageId) { this.packageId = packageId; }

    public int getOperatorId() { return operatorId; }
    public void setOperatorId(int operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public int getDestinationId() { return destinationId; }
    public void setDestinationId(int destinationId) { this.destinationId = destinationId; }

    public String getDestinationName() { return destinationName; }
    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public int getDurationNights() { return durationNights; }
    public void setDurationNights(int durationNights) { this.durationNights = durationNights; }

    public double getBasePricePerPerson() { return basePricePerPerson; }
    public void setBasePricePerPerson(double basePricePerPerson) { this.basePricePerPerson = basePricePerPerson; }

    public int getMaxTravellers() { return maxTravellers; }
    public void setMaxTravellers(int maxTravellers) { this.maxTravellers = maxTravellers; }

    public String getIncludedServices() { return includedServices; }
    public void setIncludedServices(String includedServices) { this.includedServices = includedServices; }

    public String getExcludedServices() { return excludedServices; }
    public void setExcludedServices(String excludedServices) { this.excludedServices = excludedServices; }

    public String getAccommodationDetails() { return accommodationDetails; }
    public void setAccommodationDetails(String accommodationDetails) { this.accommodationDetails = accommodationDetails; }

    public String getTransportationDetails() { return transportationDetails; }
    public void setTransportationDetails(String transportationDetails) { this.transportationDetails = transportationDetails; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<PackageItineraryDay> getItineraryDays() { return itineraryDays; }
    public void setItineraryDays(List<PackageItineraryDay> itineraryDays) { this.itineraryDays = itineraryDays; }

    public List<PackageDeparture> getDepartures() { return departures; }
    public void setDepartures(List<PackageDeparture> departures) { this.departures = departures; }
}

