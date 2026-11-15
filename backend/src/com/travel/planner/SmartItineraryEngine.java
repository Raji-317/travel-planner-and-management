package com.travel.planner;

import com.travel.model.Destination;
import com.travel.model.ItineraryDay;
import com.travel.model.ItineraryPlace;
import com.travel.model.SavedItinerary;
import com.travel.model.TrainSchedule;
import com.travel.service.TrainService;

import java.util.*;

/**
 * Intelligent Itinerary Generation Engine.
 * Uses deterministic graph clustering, TSP 2-Opt route ordering,
 * time window scheduling, and dynamic itemized budget estimation.
 */
public class SmartItineraryEngine {

    public static SavedItinerary generate(Destination destination,
                                          AttractionGraph graph,
                                          String startingLocation,
                                          int travelDays,
                                          int numTravelers,
                                          double totalBudget,
                                          List<String> interests,
                                          String travelPace,
                                          String transportMode,
                                          List<String> selectedPlaceNames) {
        SavedItinerary itinerary = new SavedItinerary();
        itinerary.setTitle(travelDays + "-Day Customized " + destination.getName() + " Adventure");
        itinerary.setStartingLocation(startingLocation != null ? startingLocation : "City Center");
        itinerary.setDestinationId(destination.getDestinationId());
        itinerary.setDestinationName(destination.getName());
        itinerary.setTravelDays(travelDays);
        itinerary.setNumTravelers(numTravelers > 0 ? numTravelers : 1);
        itinerary.setTotalBudget(totalBudget);
        itinerary.setTravelPace(travelPace != null ? travelPace : "BALANCED");
        itinerary.setPreferredTransport(transportMode != null ? transportMode : "CAR");
        itinerary.setInterestsCsv(interests != null ? String.join(",", interests) : "");

        // 1. Determine daily place target
        int placesPerDay;
        if ("RELAXED".equalsIgnoreCase(travelPace)) {
            placesPerDay = 2;
        } else if ("PACKED".equalsIgnoreCase(travelPace)) {
            placesPerDay = 4;
        } else {
            placesPerDay = 3; // BALANCED
        }
        int totalPlacesNeeded = travelDays * placesPerDay;

        // 2. Score and Rank Attractions with Tourist Selections Priority
        List<AttractionNode> allNodes = new ArrayList<>(graph.getAllNodes());
        List<AttractionNode> selectedNodes = new ArrayList<>();

        double baseLat = (destination.getLatitude() != null && destination.getLatitude() != 0.0)
                ? destination.getLatitude()
                : (!allNodes.isEmpty() ? allNodes.get(0).getLatitude() : 13.6288);
        double baseLng = (destination.getLongitude() != null && destination.getLongitude() != 0.0)
                ? destination.getLongitude()
                : (!allNodes.isEmpty() ? allNodes.get(0).getLongitude() : 79.4192);

        // If user manually chose or added specific places, guarantee every single chosen spot is included!
        if (selectedPlaceNames != null && !selectedPlaceNames.isEmpty()) {
            for (String userPick : selectedPlaceNames) {
                if (userPick == null || userPick.trim().isEmpty()) continue;
                String cleanPick = userPick.trim();
                AttractionNode matched = null;

                for (AttractionNode node : allNodes) {
                    if (node.getName().equalsIgnoreCase(cleanPick) ||
                        node.getName().toLowerCase().contains(cleanPick.toLowerCase()) ||
                        cleanPick.toLowerCase().contains(node.getName().toLowerCase())) {
                        matched = node;
                        break;
                    }
                }

                if (matched != null) {
                    if (!selectedNodes.contains(matched)) {
                        selectedNodes.add(matched);
                    }
                } else {
                    // This is a custom added spot (or newly added spot by the tourist)!
                    // Dynamically create an AttractionNode so it is guaranteed to be in the itinerary!
                    double offset = (selectedNodes.size() + 1) * 0.012;
                    AttractionNode customNode = new AttractionNode(
                            7500 + selectedNodes.size() + 1,
                            cleanPick,
                            "Must-Visit Attraction & Landmark",
                            baseLat + offset,
                            baseLng + offset,
                            75,    // duration 75 mins
                            0.0,   // entry ticket 0
                            5.0    // high priority popularity
                    );
                    graph.addNode(customNode);
                    allNodes.add(customNode);
                    selectedNodes.add(customNode);
                }
            }
        }

        // Fill remaining slots based on interest scores if user selected fewer places than needed
        allNodes.sort((a, b) -> {
            double scoreA = calculateAttractionScore(a, interests);
            double scoreB = calculateAttractionScore(b, interests);
            return Double.compare(scoreB, scoreA);
        });

        for (AttractionNode cand : allNodes) {
            if (selectedNodes.size() >= totalPlacesNeeded) break;
            if (!selectedNodes.contains(cand)) {
                selectedNodes.add(cand);
            }
        }

        // If still fewer places than needed, duplicate or take all available
        if (selectedNodes.isEmpty() && !allNodes.isEmpty()) {
            selectedNodes.addAll(allNodes);
        }

        // 3. Geographic Partitioning Across Days
        List<List<AttractionNode>> dayPartitions = partitionGeographically(selectedNodes, travelDays, graph);

        // 4. Intra-Day Route Optimization & Time Scheduling
        List<ItineraryDay> days = new ArrayList<>();
        double totalTickets = 0.0;
        double totalTransitKm = 0.0;

        for (int d = 0; d < travelDays; d++) {
            ItineraryDay day = new ItineraryDay();
            day.setDayNumber(d + 1);

            List<AttractionNode> rawDayNodes = (d < dayPartitions.size()) ? dayPartitions.get(d) : Collections.emptyList();
            List<AttractionNode> orderedDayNodes = TSPOrderOptimizer.optimizeDayOrder(rawDayNodes, graph, transportMode);

            List<ItineraryPlace> places = new ArrayList<>();
            double dayTicketsSubtotal = 0.0;
            int dayTravelTimeMin = 0;

            int currentMinute = 570; // 09:30 AM in minutes from midnight

            for (int pIdx = 0; pIdx < orderedDayNodes.size(); pIdx++) {
                AttractionNode node = orderedDayNodes.get(pIdx);
                ItineraryPlace place = new ItineraryPlace();
                place.setAttractionId(node.getId());
                place.setAttractionName(node.getName());
                place.setCategoryName(node.getCategoryName());
                place.setVisitOrder(pIdx + 1);
                place.setAllocatedDurationMin(node.getDurationMin());

                // Itemized Expenditure for this Attraction
                double entryPerPerson = node.getTicketPrice();
                double activityPerPerson = estimateActivityCost(node.getCategoryName());
                double totalPerPerson = entryPerPerson + activityPerPerson;
                double totalForGroup = totalPerPerson * itinerary.getNumTravelers();

                place.setEstimatedCost(entryPerPerson);
                place.setActivityCost(activityPerPerson);
                place.setTotalPlaceExpenditure(totalForGroup);
                place.setExpenditureBreakdown(String.format("Entry: ₹%.0f • Guide & Activity: ₹%.0f", entryPerPerson, activityPerPerson));

                dayTicketsSubtotal += totalForGroup;
                totalTickets += entryPerPerson;

                // Slot categorization
                String slot;
                if (currentMinute < 750) {
                    slot = "MORNING";
                } else if (currentMinute < 1020) {
                    slot = "AFTERNOON";
                } else {
                    slot = "EVENING";
                }
                place.setTimeSlot(slot);
                place.setVisitStartTime(formatMinuteToTimeString(currentMinute));

                currentMinute += node.getDurationMin();

                // Compute travel to next place
                if (pIdx < orderedDayNodes.size() - 1) {
                    AttractionNode nextNode = orderedDayNodes.get(pIdx + 1);
                    int travelTime = graph.getTravelTime(node.getId(), nextNode.getId(), transportMode);
                    double dist = graph.getTravelDistance(node.getId(), nextNode.getId());

                    place.setTravelTimeToNextMin(travelTime);
                    dayTravelTimeMin += travelTime;
                    totalTransitKm += dist;

                    currentMinute += travelTime;

                    // Lunch break insertion
                    if (currentMinute >= 780 && currentMinute <= 840) {
                        currentMinute += 45; // 45 min lunch break
                    }
                } else {
                    place.setTravelTimeToNextMin(0);
                }

                places.add(place);
            }

            // Day-level estimated cost itemization
            double dailyBudgetRate = destination.getDailyBudgetEstimated() > 0 ? destination.getDailyBudgetEstimated() : 3000.0;
            double dayTransport = Math.round(dayTravelTimeMin * 4.0 + 150.0);
            double dayFood = Math.round(dailyBudgetRate * 0.25 * itinerary.getNumTravelers());
            double totalDayCost = dayTicketsSubtotal + dayTransport + dayFood;

            day.setPlaces(places);
            day.setDayTicketsCost(dayTicketsSubtotal);
            day.setDayTransportCost(dayTransport);
            day.setDayFoodCost(dayFood);
            day.setEstimatedDayCost(totalDayCost);
            day.setEstimatedTravelTimeMin(dayTravelTimeMin);
            days.add(day);
        }

        itinerary.setDays(days);

        // 6. Populating Round-Trip Transit Legs and Selected Transportation Mode
        String tMode = transportMode != null ? transportMode.toUpperCase() : "TRAIN";

        com.travel.model.TransitLeg outbound = com.travel.service.TransportService.getOutboundTransit(
                itinerary.getStartingLocation(), destination.getName(), tMode);
        com.travel.model.TransitLeg returnLeg = com.travel.service.TransportService.getReturnTransit(
                itinerary.getStartingLocation(), destination.getName(), tMode);
        itinerary.setOutboundTransit(outbound);
        itinerary.setReturnTransit(returnLeg);

        // Give train details ONLY IF the tourist chooses TRAIN
        if (tMode.contains("TRAIN")) {
            List<TrainSchedule> trains = com.travel.service.TransportService.getTrainSchedules(
                    itinerary.getStartingLocation(), destination.getName());
            itinerary.setTrainSchedules(trains);
            if (!days.isEmpty() && !trains.isEmpty()) {
                TrainSchedule primary = trains.get(0);
                days.get(0).setTrainArrivalNote("🚆 Train " + primary.getTrainNumber() + " (" + primary.getTrainName() + ") reaches "
                        + primary.getArrivalStation() + " at " + primary.getArrivalTime() + " (" + primary.getDuration() + ")");
            }
        } else if (tMode.contains("BUS")) {
            List<com.travel.model.BusSchedule> buses = com.travel.service.TransportService.getBusSchedules(
                    itinerary.getStartingLocation(), destination.getName());
            itinerary.setBusSchedules(buses);
            if (!days.isEmpty() && !buses.isEmpty()) {
                com.travel.model.BusSchedule primary = buses.get(0);
                days.get(0).setTrainArrivalNote("🚌 Bus " + primary.getServiceNumber() + " (" + primary.getOperatorName() + ") drops at "
                        + primary.getDroppingPoint() + " at " + primary.getArrivalTime() + " (" + primary.getDuration() + ")");
            }
        } else {
            // CAB / CAR / AUTO / BIKE / WALKING
            List<com.travel.model.CabOption> cabs = com.travel.service.TransportService.getCabOptions(
                    itinerary.getStartingLocation(), destination.getName(), travelDays, itinerary.getNumTravelers());
            itinerary.setCabOptions(cabs);
            if (!days.isEmpty() && !cabs.isEmpty()) {
                com.travel.model.CabOption primary = cabs.get(0);
                days.get(0).setTrainArrivalNote("🚗 " + primary.getServiceName() + " (" + primary.getProvider() + ") — "
                        + primary.getPickupDuration() + " with driver & fuel allowance");
            }
        }

        // 7. Dynamic Budget Estimation
        BudgetEstimator.BudgetBreakdown breakdown = BudgetEstimator.calculate(
                travelDays,
                itinerary.getNumTravelers(),
                totalBudget,
                totalTickets,
                totalTransitKm,
                transportMode,
                destination.getDailyBudgetEstimated() > 0 ? destination.getDailyBudgetEstimated() : 3000.0
        );

        itinerary.setBudgetBreakdown(breakdown);
        itinerary.setEstimatedCost(breakdown.getTotalEstimatedCost());

        return itinerary;
    }

    public static SavedItinerary generate(Destination destination,
                                          AttractionGraph graph,
                                          String startingLocation,
                                          int travelDays,
                                          int numTravelers,
                                          double totalBudget,
                                          List<String> interests,
                                          String travelPace,
                                          String transportMode) {
        return generate(destination, graph, startingLocation, travelDays, numTravelers,
                totalBudget, interests, travelPace, transportMode, null);
    }

    private static double estimateActivityCost(String category) {
        if (category == null) return 50.0;
        String cat = category.toLowerCase();
        if (cat.contains("adventure")) return 250.0;
        if (cat.contains("beach")) return 150.0;
        if (cat.contains("heritage")) return 80.0;
        if (cat.contains("nature")) return 60.0;
        if (cat.contains("shopping")) return 100.0;
        if (cat.contains("food")) return 120.0;
        return 40.0;
    }

    private static double calculateAttractionScore(AttractionNode node, List<String> interests) {
        double score = node.getPopularity();
        if (interests != null && !interests.isEmpty()) {
            for (String interest : interests) {
                if (node.getCategoryName() != null && node.getCategoryName().toLowerCase().contains(interest.toLowerCase())) {
                    score += 4.0; // Strong category preference boost
                    break;
                }
            }
        }
        return score;
    }

    private static List<List<AttractionNode>> partitionGeographically(List<AttractionNode> nodes, int days, AttractionGraph graph) {
        List<List<AttractionNode>> partitions = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            partitions.add(new ArrayList<>());
        }
        if (nodes.isEmpty()) return partitions;

        List<AttractionNode> remaining = new ArrayList<>(nodes);
        int dayIndex = 0;

        while (!remaining.isEmpty()) {
            if (partitions.get(dayIndex).isEmpty()) {
                partitions.get(dayIndex).add(remaining.remove(0));
            } else {
                AttractionNode last = partitions.get(dayIndex).get(partitions.get(dayIndex).size() - 1);
                AttractionNode closest = null;
                int minDist = Integer.MAX_VALUE;
                for (AttractionNode cand : remaining) {
                    int dist = graph.getTravelTime(last.getId(), cand.getId(), "CAR");
                    if (dist < minDist) {
                        minDist = dist;
                        closest = cand;
                    }
                }
                if (closest != null) {
                    remaining.remove(closest);
                    partitions.get(dayIndex).add(closest);
                } else {
                    partitions.get(dayIndex).add(remaining.remove(0));
                }
            }
            dayIndex = (dayIndex + 1) % days;
        }

        return partitions;
    }

    private static String formatMinuteToTimeString(int minutes) {
        int hours = (minutes / 60) % 24;
        int mins = minutes % 60;
        String period = hours >= 12 ? "PM" : "AM";
        int displayHour = hours % 12;
        if (displayHour == 0) displayHour = 12;
        return String.format("%02d:%02d %s", displayHour, mins, period);
    }
}
