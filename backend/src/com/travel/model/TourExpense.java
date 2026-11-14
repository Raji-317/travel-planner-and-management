package com.travel.model;

import java.sql.Timestamp;

public class TourExpense {
    private int expenseId;
    private Integer itineraryId;
    private Integer bookingId;
    private Integer userId;
    private String category; // FOOD, TRANSIT, TICKETS, HOTEL, SHOPPING, OTHER
    private String title;
    private double amount;
    private String expenseDate;
    private String notes;
    private Timestamp createdAt;

    public TourExpense() {}

    public int getExpenseId() { return expenseId; }
    public void setExpenseId(int expenseId) { this.expenseId = expenseId; }

    public Integer getItineraryId() { return itineraryId; }
    public void setItineraryId(Integer itineraryId) { this.itineraryId = itineraryId; }

    public Integer getBookingId() { return bookingId; }
    public void setBookingId(Integer bookingId) { this.bookingId = bookingId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getExpenseDate() { return expenseDate; }
    public void setExpenseDate(String expenseDate) { this.expenseDate = expenseDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
