package com.travel.planner;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Calculates itemized trip budgets and evaluates affordability.
 */
public class BudgetEstimator {

    public static class BudgetBreakdown {
        private double transportCost;
        private double accommodationCost;
        private double foodCost;
        private double ticketCost;
        private double activitiesMiscCost;
        private double totalEstimatedCost;
        private double costPerPerson;
        private double remainingBudget;
        private boolean isExceeded;
        private String affordabilityMessage;

        public double getTransportCost() { return transportCost; }
        public void setTransportCost(double transportCost) { this.transportCost = transportCost; }

        public double getAccommodationCost() { return accommodationCost; }
        public void setAccommodationCost(double accommodationCost) { this.accommodationCost = accommodationCost; }

        public double getFoodCost() { return foodCost; }
        public void setFoodCost(double foodCost) { this.foodCost = foodCost; }

        public double getTicketCost() { return ticketCost; }
        public void setTicketCost(double ticketCost) { this.ticketCost = ticketCost; }

        public double getActivitiesMiscCost() { return activitiesMiscCost; }
        public void setActivitiesMiscCost(double activitiesMiscCost) { this.activitiesMiscCost = activitiesMiscCost; }

        public double getTotalEstimatedCost() { return totalEstimatedCost; }
        public void setTotalEstimatedCost(double totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }

        public double getCostPerPerson() { return costPerPerson; }
        public void setCostPerPerson(double costPerPerson) { this.costPerPerson = costPerPerson; }

        public double getRemainingBudget() { return remainingBudget; }
        public void setRemainingBudget(double remainingBudget) { this.remainingBudget = remainingBudget; }

        public boolean isExceeded() { return isExceeded; }
        public void setExceeded(boolean exceeded) { isExceeded = exceeded; }

        public String getAffordabilityMessage() { return affordabilityMessage; }
        public void setAffordabilityMessage(String affordabilityMessage) { this.affordabilityMessage = affordabilityMessage; }
    }

    public static BudgetBreakdown calculate(int travelDays, int travelers, double userBudget,
                                           double totalTicketPrices, double totalTransitKm,
                                           String transportMode, double destDailyRate) {
        BudgetBreakdown b = new BudgetBreakdown();

        // 1. Transport Cost (Dynamically calculated based on chosen mode)
        String modeUpper = transportMode != null ? transportMode.toUpperCase() : "TRAIN";
        double transport;

        if (modeUpper.contains("TRAIN")) {
            // Round-trip train ticket per person (~₹380 each way) + local auto/cab sight distance
            double roundTripTrain = 380.0 * 2 * travelers;
            double localTransit = Math.round(totalTransitKm * 3.0);
            transport = roundTripTrain + localTransit;
        } else if (modeUpper.contains("BUS")) {
            // Round-trip State RTC / Volvo bus per person (~₹480 each way) + local sight transit
            double roundTripBus = 480.0 * 2 * travelers;
            double localTransit = Math.round(totalTransitKm * 3.5);
            transport = roundTripBus + localTransit;
        } else if (modeUpper.contains("CAB") || modeUpper.contains("CAR")) {
            // Dedicated AC Cab rental (~₹2,200 per day for group) + fuel
            transport = Math.round(2200.0 * Math.max(1, travelDays) + (totalTransitKm * 5.0));
        } else if (modeUpper.contains("BIKE")) {
            // Bike rental (~₹700 per day) + fuel
            int bikesNeeded = (int) Math.ceil((double) travelers / 2.0);
            transport = Math.round((700.0 * travelDays * bikesNeeded) + (totalTransitKm * 4.0));
        } else if (modeUpper.contains("AUTO")) {
            // Local auto rickshaw hire
            transport = Math.round(950.0 * travelDays);
        } else {
            double ratePerKm = getRatePerKm(transportMode);
            transport = Math.round(totalTransitKm * ratePerKm);
        }

        if (transport < 400) transport = 400; // minimum base transport floor
        b.setTransportCost(transport);

        // 2. Accommodation Cost (Rooms = ceil(travelers / 2))
        int rooms = (int) Math.ceil((double) travelers / 2.0);
        double hotelPerNight = destDailyRate * 0.50; // 50% of destination daily baseline
        double accommodation = Math.round(hotelPerNight * (travelDays > 1 ? travelDays - 1 : 1) * rooms);
        b.setAccommodationCost(accommodation);

        // 3. Food Cost (Per traveler per day)
        double foodPerDayPerPerson = destDailyRate * 0.25;
        double food = Math.round(foodPerDayPerPerson * travelDays * travelers);
        b.setFoodCost(food);

        // 4. Entry Tickets
        double tickets = Math.round(totalTicketPrices * travelers);
        b.setTicketCost(tickets);

        // 5. Activities & Miscellaneous
        double misc = Math.round(200.0 * travelDays * travelers);
        b.setActivitiesMiscCost(misc);

        // Totals
        double total = transport + accommodation + food + tickets + misc;
        b.setTotalEstimatedCost(total);
        b.setCostPerPerson(Math.round(total / travelers));
        b.setRemainingBudget(Math.round(userBudget - total));

        if (total > userBudget) {
            b.setExceeded(true);
            double excess = total - userBudget;
            b.setAffordabilityMessage(String.format("Estimated itinerary exceeds target budget by ₹%.0f. "
                    + "Suggested adjustments: Use public transit or consider alternative free attractions.", excess));
        } else {
            b.setExceeded(false);
            b.setAffordabilityMessage(String.format("Itinerary is well within budget! You have approximately ₹%.0f in reserve funds.", userBudget - total));
        }

        return b;
    }

    private static double getRatePerKm(String mode) {
        if ("TRAIN".equalsIgnoreCase(mode)) return 2.2; // Train standard per km
        if ("PUBLIC_TRANSPORT".equalsIgnoreCase(mode)) return 5.0;
        if ("BIKE".equalsIgnoreCase(mode)) return 6.0;
        if ("WALKING".equalsIgnoreCase(mode)) return 0.0;
        return 16.0; // Private AC Cab
    }
}

