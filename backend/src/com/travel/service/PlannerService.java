package com.travel.service;

import com.travel.exception.ValidationException;
import com.travel.model.Destination;
import com.travel.model.SavedItinerary;
import com.travel.planner.AttractionGraph;
import com.travel.planner.AttractionNode;
import com.travel.planner.IndiaTourismEngine;
import com.travel.planner.SmartItineraryEngine;
import com.travel.repository.DestinationRepository;
import com.travel.repository.PlannerRepository;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PlannerService {

    private final PlannerRepository plannerRepository = new PlannerRepository();
    private final DestinationRepository destinationRepository = new DestinationRepository();

    public SavedItinerary generateItinerary(int destinationId, String destinationName, String startingLocation,
                                            int travelDays, int numTravelers, double totalBudget,
                                            List<String> interests, String travelPace, String transportMode,
                                            List<String> selectedPlaceNames) {
        if (travelDays <= 0 || travelDays > 14) {
            throw new ValidationException("Trip duration must be between 1 and 14 days.");
        }
        if (numTravelers <= 0 || numTravelers > 30) {
            throw new ValidationException("Number of travelers must be between 1 and 30.");
        }
        if (totalBudget <= 0) {
            throw new ValidationException("Please enter a valid positive travel budget.");
        }

        Destination dest = null;
        AttractionGraph graph = null;

        // 1. Try finding in database if valid ID provided
        if (destinationId > 0) {
            dest = destinationRepository.findById(destinationId);
            if (dest != null) {
                graph = plannerRepository.loadGraphForDestination(destinationId);
            }
        }

        // 2. If destination not in database or custom name given, use India Tourism Engine
        if (dest == null || graph == null || graph.getAllNodes().isEmpty()) {
            String resolvedName = (destinationName != null && !destinationName.trim().isEmpty())
                    ? destinationName.trim()
                    : (dest != null ? dest.getName() : "India Destination");

            dest = new Destination();
            dest.setDestinationId(destinationId > 0 ? destinationId : 9999);
            dest.setName(resolvedName);
            dest.setState("India");
            dest.setCountry("India");
            dest.setDailyBudgetEstimated(3200.0);

            List<IndiaTourismEngine.IndiaPlaceInfo> places = IndiaTourismEngine.getPlacesForLocation(resolvedName);
            List<AttractionNode> nodes = IndiaTourismEngine.convertToNodes(places);
            graph = IndiaTourismEngine.buildGraph(nodes);
        }

        return SmartItineraryEngine.generate(dest, graph, startingLocation, travelDays, numTravelers,
                totalBudget, interests, travelPace, transportMode, selectedPlaceNames);
    }

    // Overload for backwards compatibility with tests
    public SavedItinerary generateItinerary(int destinationId, String startingLocation, int travelDays,
                                            int numTravelers, double totalBudget, List<String> interests,
                                            String travelPace, String transportMode) {
        return generateItinerary(destinationId, null, startingLocation, travelDays, numTravelers,
                totalBudget, interests, travelPace, transportMode, null);
    }

    public List<IndiaTourismEngine.IndiaPlaceInfo> getPlacesForDestination(String destinationName, int destinationId) {
        String name = destinationName;
        if ((name == null || name.trim().isEmpty()) && destinationId > 0) {
            Destination d = destinationRepository.findById(destinationId);
            if (d != null) name = d.getName();
        }
        return IndiaTourismEngine.getPlacesForLocation(name);
    }

    public SavedItinerary saveItinerary(SavedItinerary itin) {
        if (itin.getTitle() == null || itin.getTitle().trim().isEmpty()) {
            throw new ValidationException("Itinerary title is required.");
        }
        try {
            return plannerRepository.saveItinerary(itin);
        } catch (SQLException e) {
            throw new RuntimeException("Error saving customized itinerary: " + e.getMessage(), e);
        }
    }

    public List<SavedItinerary> getUserItineraries(int userId) {
        return plannerRepository.findUserItineraries(userId);
    }

    public SavedItinerary getItineraryById(int itineraryId) {
        SavedItinerary itin = plannerRepository.findById(itineraryId);
        if (itin == null) {
            throw new ValidationException("Itinerary not found for ID: " + itineraryId);
        }
        return itin;
    }
}
