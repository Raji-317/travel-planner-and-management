package com.travel.test;

import com.travel.model.ItineraryDay;
import com.travel.model.ItineraryPlace;
import com.travel.model.SavedItinerary;
import com.travel.service.PlannerService;

import java.util.Arrays;
import java.util.Collections;

public class ItineraryPlannerTest {
    public static void main(String[] args) {
        System.out.println("--- Testing Custom Destination Itinerary Generation ---");
        PlannerService service = new PlannerService();

        SavedItinerary itin = service.generateItinerary(
                0,
                "Aaraku",
                "Amaravathi",
                3,
                2,
                10000.0,
                Arrays.asList("Nature", "Adventure"),
                "BALANCED",
                "TRAIN",
                Collections.emptyList()
        );

        System.out.println("Itinerary Title: " + itin.getTitle());
        System.out.println("Starting Location: " + itin.getStartingLocation());
        System.out.println("Estimated Total Cost: Rs." + itin.getEstimatedCost());
        System.out.println("Days Generated: " + itin.getDays().size());

        if (itin.getTrainSchedules() != null && !itin.getTrainSchedules().isEmpty()) {
            System.out.println("Trains available: " + itin.getTrainSchedules().size());
            System.out.println("Primary Train: " + itin.getTrainSchedules().get(0).getTrainName()
                    + " (" + itin.getTrainSchedules().get(0).getDepartureTime()
                    + " -> " + itin.getTrainSchedules().get(0).getArrivalTime() + ")");
        }

        for (ItineraryDay day : itin.getDays()) {
            System.out.println("Day " + day.getDayNumber() + ": Day Date: " + day.getDayDate() + " [Day Cost: Rs." + day.getEstimatedDayCost() + "]");
            if (day.getTrainArrivalNote() != null) {
                System.out.println("   [Train Arrival Note]: " + day.getTrainArrivalNote());
            }
            for (ItineraryPlace p : day.getPlaces()) {
                System.out.println("   * " + p.getAttractionName() + " (" + p.getVisitStartTime() + ") [Tickets: Rs." + p.getEstimatedCost() + ", Activity: Rs." + p.getActivityCost() + ", Total: Rs." + p.getTotalPlaceExpenditure() + "]");
            }
        }
        System.out.println(">>> [SUCCESS] Custom Itinerary generated seamlessly! <<<");
    }
}
