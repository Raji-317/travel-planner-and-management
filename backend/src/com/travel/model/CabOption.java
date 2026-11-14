package com.travel.model;

public class CabOption {
    private String serviceName;
    private String vehicleType; // SEDAN, SUV, AUTO, BIKE, TEMPO
    private String provider;
    private String capacity;
    private double estimatedTotalFare;
    private String ratePerKm;
    private String driverAllowance;
    private String tollTaxes;
    private String pickupDuration;
    private String features;

    public CabOption() {}

    public CabOption(String serviceName, String vehicleType, String provider, String capacity,
                     double estimatedTotalFare, String ratePerKm, String driverAllowance,
                     String tollTaxes, String pickupDuration, String features) {
        this.serviceName = serviceName;
        this.vehicleType = vehicleType;
        this.provider = provider;
        this.capacity = capacity;
        this.estimatedTotalFare = estimatedTotalFare;
        this.ratePerKm = ratePerKm;
        this.driverAllowance = driverAllowance;
        this.tollTaxes = tollTaxes;
        this.pickupDuration = pickupDuration;
        this.features = features;
    }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getCapacity() { return capacity; }
    public void setCapacity(String capacity) { this.capacity = capacity; }

    public double getEstimatedTotalFare() { return estimatedTotalFare; }
    public void setEstimatedTotalFare(double estimatedTotalFare) { this.estimatedTotalFare = estimatedTotalFare; }

    public String getRatePerKm() { return ratePerKm; }
    public void setRatePerKm(String ratePerKm) { this.ratePerKm = ratePerKm; }

    public String getDriverAllowance() { return driverAllowance; }
    public void setDriverAllowance(String driverAllowance) { this.driverAllowance = driverAllowance; }

    public String getTollTaxes() { return tollTaxes; }
    public void setTollTaxes(String tollTaxes) { this.tollTaxes = tollTaxes; }

    public String getPickupDuration() { return pickupDuration; }
    public void setPickupDuration(String pickupDuration) { this.pickupDuration = pickupDuration; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
}
