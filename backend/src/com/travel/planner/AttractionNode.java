package com.travel.planner;

public class AttractionNode {
    private int id;
    private String name;
    private int categoryId;
    private String categoryName;
    private int durationMin;
    private double ticketPrice;
    private int openMinuteOfDay;  // e.g. 09:00 -> 540
    private int closeMinuteOfDay; // e.g. 18:00 -> 1080
    private double latitude;
    private double longitude;
    private double popularity;

    public AttractionNode(int id, String name, int categoryId, String categoryName, int durationMin,
                          double ticketPrice, String openTime, String closeTime,
                          double latitude, double longitude, double popularity) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.durationMin = durationMin;
        this.ticketPrice = ticketPrice;
        this.openMinuteOfDay = parseTimeToMinutes(openTime, 540);
        this.closeMinuteOfDay = parseTimeToMinutes(closeTime, 1080);
        this.latitude = latitude;
        this.longitude = longitude;
        this.popularity = popularity;
    }

    public AttractionNode(int id, String name, String categoryName, double latitude, double longitude,
                          int durationMin, double ticketPrice, double popularity) {
        this(id, name, 1, categoryName, durationMin, ticketPrice, "09:00:00", "18:00:00", latitude, longitude, popularity);
    }

    private int parseTimeToMinutes(String timeStr, int defaultMin) {
        if (timeStr == null || !timeStr.contains(":")) return defaultMin;
        try {
            String[] parts = timeStr.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            return defaultMin;
        }
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public int getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public int getDurationMin() { return durationMin; }
    public double getTicketPrice() { return ticketPrice; }
    public int getOpenMinuteOfDay() { return openMinuteOfDay; }
    public int getCloseMinuteOfDay() { return closeMinuteOfDay; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double getPopularity() { return popularity; }
}

