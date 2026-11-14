package com.travel.model;

import com.travel.planner.BudgetEstimator;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class SavedItinerary {
    private int itineraryId;
    private Integer userId;
    private String shareToken;
    private String title;
    private String startingLocation;
    private int destinationId;
    private String destinationName;
    private int travelDays;
    private int numTravelers;
    private double totalBudget;
    private double estimatedCost;
    private String travelPace; // RELAXED, BALANCED, PACKED
    private String preferredTransport; // CAR, BIKE, PUBLIC_TRANSPORT, WALKING
    private String interestsCsv;
    private Timestamp createdAt;

    private List<ItineraryDay> days = new ArrayList<>();
    private BudgetEstimator.BudgetBreakdown budgetBreakdown;
    private List<TrainSchedule> trainSchedules = new ArrayList<>();
    private List<BusSchedule> busSchedules = new ArrayList<>();
    private List<CabOption> cabOptions = new ArrayList<>();
    private TransitLeg outboundTransit;
    private TransitLeg returnTransit;
    private List<TourExpense> loggedExpenses = new ArrayList<>();

    public SavedItinerary() {}

    public List<BusSchedule> getBusSchedules() { return busSchedules; }
    public void setBusSchedules(List<BusSchedule> busSchedules) { this.busSchedules = busSchedules; }

    public List<CabOption> getCabOptions() { return cabOptions; }
    public void setCabOptions(List<CabOption> cabOptions) { this.cabOptions = cabOptions; }

    public TransitLeg getOutboundTransit() { return outboundTransit; }
    public void setOutboundTransit(TransitLeg outboundTransit) { this.outboundTransit = outboundTransit; }

    public TransitLeg getReturnTransit() { return returnTransit; }
    public void setReturnTransit(TransitLeg returnTransit) { this.returnTransit = returnTransit; }

    public List<TourExpense> getLoggedExpenses() { return loggedExpenses; }
    public void setLoggedExpenses(List<TourExpense> loggedExpenses) { this.loggedExpenses = loggedExpenses; }

    public int getItineraryId() { return itineraryId; }
    public void setItineraryId(int itineraryId) { this.itineraryId = itineraryId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStartingLocation() { return startingLocation; }
    public void setStartingLocation(String startingLocation) { this.startingLocation = startingLocation; }

    public int getDestinationId() { return destinationId; }
    public void setDestinationId(int destinationId) { this.destinationId = destinationId; }

    public String getDestinationName() { return destinationName; }
    public void setDestinationName(String destinationName) { this.destinationName = destinationName; }

    public int getTravelDays() { return travelDays; }
    public void setTravelDays(int travelDays) { this.travelDays = travelDays; }

    public int getNumTravelers() { return numTravelers; }
    public void setNumTravelers(int numTravelers) { this.numTravelers = numTravelers; }

    public double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(double totalBudget) { this.totalBudget = totalBudget; }

    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getTravelPace() { return travelPace; }
    public void setTravelPace(String travelPace) { this.travelPace = travelPace; }

    public String getPreferredTransport() { return preferredTransport; }
    public void setPreferredTransport(String preferredTransport) { this.preferredTransport = preferredTransport; }

    public String getInterestsCsv() { return interestsCsv; }
    public void setInterestsCsv(String interestsCsv) { this.interestsCsv = interestsCsv; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<ItineraryDay> getDays() { return days; }
    public void setDays(List<ItineraryDay> days) { this.days = days; }

    public BudgetEstimator.BudgetBreakdown getBudgetBreakdown() { return budgetBreakdown; }
    public void setBudgetBreakdown(BudgetEstimator.BudgetBreakdown budgetBreakdown) { this.budgetBreakdown = budgetBreakdown; }

    public List<TrainSchedule> getTrainSchedules() { return trainSchedules; }
    public void setTrainSchedules(List<TrainSchedule> trainSchedules) { this.trainSchedules = trainSchedules; }
}

